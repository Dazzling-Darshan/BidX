import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { connectDB, disconnectDB } from "../config/db.config.js";
import { generateTextEmbedding } from "../services/gemini.service.js";

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    // Find auctions that don't have embeddings or have empty embedding arrays
    const auctions = await Product.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
      ],
    }).select("+embedding itemName itemCategory itemDescription");

    console.log(`Found ${auctions.length} auctions requiring vector embeddings.`);

    for (let i = 0; i < auctions.length; i++) {
      const auction = auctions[i];
      console.log(
        `[${i + 1}/${auctions.length}] Generating embedding for: "${auction.itemName}"...`,
      );

      const textToEmbed = `${auction.itemName}. Category: ${auction.itemCategory}. ${auction.itemDescription}`;
      try {
        const embedding = await generateTextEmbedding(textToEmbed);
        if (embedding && embedding.length > 0) {
          auction.embedding = embedding;
          await auction.save();
          console.log(`  -> Saved embedding (${embedding.length} dimensions)`);
        } else {
          console.log(`  -> Empty embedding received, skipped.`);
        }
      } catch (err) {
        console.error(`  -> Failed for "${auction.itemName}":`, err.message);
      }

      // Short delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 400));
    }

    console.log("Backfill complete!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

run();
