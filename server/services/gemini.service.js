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
};

/**
 * Analyze an auction product photo and return structured listing details.
 */
export const analyzeAuctionImage = async (imageUrl) => {
  if (!imageUrl) {
    throw new Error("Image URL is required for AI analysis");
  }

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const imagePart = await fetchImageAsBase64(imageUrl);

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

  const result = await model.generateContent([prompt, imagePart]);
  const rawText = result.response.text().trim();

  // Parse JSON response safely
  let parsed;
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse Gemini response as JSON:", rawText);
    throw new Error("Failed to process AI response into structured data.");
  }

  // Ensure category matches allowed categories
  let category = parsed.itemCategory;
  if (!ALLOWED_CATEGORIES.includes(category)) {
    const matched = ALLOWED_CATEGORIES.find(
      (c) => c.toLowerCase() === (category || "").toLowerCase(),
    );
    category = matched || "Other";
  }

  // Ensure starting price is a valid positive number
  let price = Number(parsed.startingPrice);
  if (isNaN(price) || price < 1) {
    price = 500;
  }

  return {
    itemName: parsed.itemName || "Untitled Auction Item",
    itemCategory: category,
    startingPrice: Math.round(price),
    itemDescription: parsed.itemDescription || "No description provided.",
  };
};

/**
 * Generate vector embedding for text using Google Gemini gemini-embedding-001
 */
export const generateTextEmbedding = async (text) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    return [];
  }

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent(text.trim());
  return result.embedding?.values || [];
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

