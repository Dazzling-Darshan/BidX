import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { env } from "../config/env.config.js";

export const ALLOWED_CATEGORIES = [
  "Electronics",
  "Antiques",
  "Art",
  "Books",
  "Clothing",
  "Collectibles",
  "Home & Garden",
  "Jewelry",
  "Musical Instruments",
  "Sports",
  "Toys",
  "Vehicles",
  "Other",
];

let genAIInstance = null;

const getGenAI = () => {
  if (!env.gemini_api_key) {
    throw new Error(
      "GEMINI_API_KEY is not configured in server environment (.env).",
    );
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(env.gemini_api_key);
  }
  return genAIInstance;
};

/**
 * Download image from URL and convert to inline data object for Gemini
 */
const fetchImageAsBase64 = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
    });

    const mimeType =
      response.headers["content-type"]?.split(";")[0] || "image/jpeg";
    const base64Data = Buffer.from(response.data).toString("base64");

    return {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    };
  } catch (err) {
    throw new Error(`Failed to download product image for AI analysis: ${err.message}`);
  }
};

/**
 * Check whether an error is transient (e.g., 503 UNAVAILABLE, 429 RESOURCE_EXHAUSTED, overload)
 */
const isTransientError = (err) => {
  const msg = (err?.message || "").toLowerCase();
  const status = err?.status || err?.code;
  return (
    status === 503 ||
    status === 429 ||
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("high demand") ||
    msg.includes("no capacity") ||
    msg.includes("resource exhausted") ||
    msg.includes("rate limit") ||
    msg.includes("quota")
  );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Analyze an auction product photo and return structured listing details.
 * Uses tested and verified Gemini 3.x models with automatic fallback.
 */
export const analyzeAuctionImage = async (imageUrl) => {
  if (!imageUrl) {
    throw new Error("Image URL is required for AI analysis");
  }

  const genAI = getGenAI();
  const imagePart = await fetchImageAsBase64(imageUrl);

  // Active verified models on this API key (gemini-3.5-flash, gemini-3.6-flash, gemini-3.5-flash-lite)
  const candidateModels = [
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
  ];

  const prompt = `
You are an expert appraiser and cataloger for an online auction marketplace.
Analyze the provided product image and generate listing details for this item.

You must respond with a JSON object following this EXACT schema:
{
  "itemName": "Concise, descriptive title (maximum 70 characters)",
  "itemCategory": "Must be one of the allowed categories",
  "startingPrice": 500,
  "itemDescription": "A compelling, professional 2-4 paragraph description highlighting the item's appearance, features, potential value, and estimated condition."
}

Rules:
1. "itemCategory" MUST be EXACTLY one of the following strings:
${JSON.stringify(ALLOWED_CATEGORIES)}
2. "startingPrice" must be a reasonable starting bid in INR (Indian Rupees, Rs) as a positive integer (minimum 100).
3. "itemName" should include the brand, model, or defining characteristics if recognizable.
4. "itemDescription" should be well-structured, professional, and highlight notable visual details.
5. Return ONLY valid JSON, with no markdown code blocks or additional text.
`;

  let lastError = null;
  let isOverloaded = false;

  for (const modelName of candidateModels) {
    const maxAttempts = 2; // Try up to 2 times per model
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini] Requesting analysis via model=${modelName} (attempt ${attempt}/${maxAttempts})`);
        
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const result = await model.generateContent([prompt, imagePart]);
        
        // Safely inspect response and candidates
        const candidate = result?.response?.candidates?.[0];
        if (candidate?.finishReason === "SAFETY") {
          const err = new Error("This image could not be processed by AI safety filters. Please try another photo.");
          err.isSafety = true;
          throw err;
        }

        let rawText = "";
        try {
          rawText = result.response.text()?.trim() || "";
        } catch (textErr) {
          throw new Error("Gemini returned an empty response for this image.");
        }

        if (!rawText) {
          throw new Error("No text content returned from Gemini Vision model.");
        }

        // Clean markdown backticks if any were included
        const cleaned = rawText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        let parsed;
        try {
          parsed = JSON.parse(cleaned);
        } catch (parseErr) {
          console.error("[Gemini] Failed to parse model output as JSON:", rawText);
          throw new Error("AI returned unstructured content. Please try again.");
        }

        // Ensure category is sanitized
        let category = parsed.itemCategory;
        if (!ALLOWED_CATEGORIES.includes(category)) {
          const matched = ALLOWED_CATEGORIES.find(
            (c) => c.toLowerCase() === (category || "").toLowerCase(),
          );
          category = matched || "Other";
        }

        // Ensure startingPrice is a clean integer >= 1
        let price = Number(parsed.startingPrice);
        if (isNaN(price) || price < 1) {
          price = 500;
        }

        console.log(`[Gemini] Successfully generated listing using model=${modelName}`);
        return {
          itemName: parsed.itemName?.slice(0, 80) || "Untitled Auction Item",
          itemCategory: category,
          startingPrice: Math.round(price),
          itemDescription: parsed.itemDescription || "Detailed description unavailable.",
        };
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini] model=${modelName} attempt=${attempt} failed: ${err.message}`);

        // If it's a safety filter, don't retry other models — abort immediately
        if (err.isSafety) {
          throw err;
        }

        if (isTransientError(err)) {
          isOverloaded = true;
          if (attempt < maxAttempts) {
            const backoff = 1000 * attempt;
            console.log(`[Gemini] Waiting ${backoff}ms before retrying model=${modelName}...`);
            await sleep(backoff);
            continue;
          }
        } else {
          // If model is unsupported or 404, break to next candidate model immediately
          break;
        }
      }
    }
  }

  // If all candidate models and retries failed
  console.error("[Gemini] All candidate models failed. Last error:", lastError?.message);

  const cleanMessage = isOverloaded || isTransientError(lastError)
    ? "Gemini AI service is currently experiencing high demand. Please enter your listing details manually or try again in a few moments."
    : "AI listing generation is temporarily unavailable. Please enter the details manually.";

  const errorObj = new Error(cleanMessage);
  errorObj.isOverloaded = isOverloaded || isTransientError(lastError);
  errorObj.originalError = lastError;
  throw errorObj;
};

/**
 * Generate vector embedding for text using Google Gemini gemini-embedding-001 with fallback
 */
export const generateTextEmbedding = async (text) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    return [];
  }

  const embeddingModels = ["gemini-embedding-001", "gemini-embedding-2"];
  const genAI = getGenAI();

  for (const modelName of embeddingModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent(text.trim());
      if (result?.embedding?.values?.length) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn(`[Gemini Embedding] Model ${modelName} failed: ${err.message}`);
    }
  }

  // Graceful degradation: return empty embedding array so creation never fails
  return [];
};

/**
 * Calculate cosine similarity between two vector float arrays
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized text embeddings)
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (
    !vecA ||
    !vecB ||
    vecA.length === 0 ||
    vecB.length === 0 ||
    vecA.length !== vecB.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
