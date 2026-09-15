import getImageUrl, { cloudinary } from "../services/cloudinaryService.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { getIO } from "../socket/index.js";
import Upload from "../models/upload.model.js";
import {
  analyzeAuctionImage,
  generateTextEmbedding,
  cosineSimilarity,
} from "../services/gemini.service.js";

export const createAuction = async (req, res) => {
  try {
    const {
      itemName,
      startingPrice,
      itemDescription,
      itemCategory,
      itemStartDate,
      itemEndDate,
      formId,
      public_id,
      secure_url,
    } = req.body;

    const start = itemStartDate ? new Date(itemStartDate) : new Date();
    const end = new Date(itemEndDate);
    if (end <= start) {
      return res
        .status(400)
        .json({ message: "Auction end date must be after start date" });
    }

    const upload = await Upload.findOne({ formId });

    if (!upload) {
      return res.status(400).json({
        message: "Invalid upload session",
      });
    }

    if (!public_id || !secure_url) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    // Generate vector embedding for semantic search / similarity
    let embedding = [];
    try {
      const textToEmbed = `${itemName}. Category: ${itemCategory}. ${itemDescription}`;
      embedding = await generateTextEmbedding(textToEmbed);
    } catch (embErr) {
      console.error(
        "Embedding generation failed (continuing without embedding):",
        embErr.message,
      );
    }

    const newAuction = new Product({
      itemName,
      startingPrice,
      currentPrice: startingPrice,
      itemDescription,
      itemCategory,
      itemImage: {
        public_id,
        url: secure_url,
      },
      itemStartDate: start,
      itemEndDate: end,
      seller: req.user.id,
      embedding,
    });
    await newAuction.save();

    upload.status = "used";
    await upload.save();

    res
      .status(201)
      .json({ message: "Auction created successfully", newAuction });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating auction", error: error.message });
  }
};

export const showAuction = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    const { category, search, sortBy, status } = req.query;

    const now = new Date();
    const filter = {};

    if (status === "endingSoon") {
      filter.itemEndDate = {
        $gt: now,
        $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      };
    } else {
      filter.itemEndDate = { $gt: now };
    }

    if (category && category.toLowerCase() !== "all") {
      filter.itemCategory = category;
    }

    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { itemName: { $regex: escaped, $options: "i" } },
        { itemDescription: { $regex: escaped, $options: "i" } },
      ];
    }

    const total = await Product.countDocuments(filter);

    let query = Product.find(filter)
      .populate("seller", "name")
      .select(
        "itemName itemDescription currentPrice startingPrice bids itemEndDate itemCategory itemImage seller createdAt",
      );

    if (sortBy === "endingSoon") {
      query = query.sort({ itemEndDate: 1 });
    } else if (sortBy === "priceAsc") {
      query = query.sort({ currentPrice: 1 });
    } else if (sortBy === "priceDesc") {
      query = query.sort({ currentPrice: -1 });
    } else if (sortBy === "newest") {
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ itemEndDate: 1 });
    }

    const auction = await query.skip(skip).limit(limit);

    let formatted = auction.map((item) => ({
      _id: item._id,
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      currentPrice: item.currentPrice,
      startingPrice: item.startingPrice,
      bidsCount: item.bids.length,
      timeLeft: Math.max(0, new Date(item.itemEndDate) - now),
      itemCategory: item.itemCategory,
      sellerName: item.seller?.name || "Unknown",
      itemPhoto: item.itemImage?.url,
      itemEndDate: item.itemEndDate,
    }));

    if (sortBy === "mostBids") {
      formatted.sort((a, b) => b.bidsCount - a.bidsCount);
    }

    res.status(200).json({
      auctions: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching auctions", error: error.message });
  }
};

export const auctionById = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Product.findById(id)
      .populate("seller", "name")
      .populate("bids.bidder", "name")
      .populate("winner", "name");

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Auto-set winner when auction has ended and has bids but no winner yet
    const isExpired = new Date(auction.itemEndDate) < new Date();
    if (isExpired && !auction.winner && auction.bids.length > 0) {
      const sortedBids = [...auction.bids].sort(
        (a, b) => b.bidAmount - a.bidAmount,
      );
      const highestBid = sortedBids[0];
      auction.winner = highestBid.bidder?._id || highestBid.bidder;
      auction.isSold = true;
      await auction.save();
      await auction.populate("winner", "name");
    }

    auction.bids.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
    res.status(200).json(auction);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching auctions", error: error.message });
  }
};

export const placeBid = async (req, res) => {
  try {
    const bidAmount = Number(req.body.bidAmount);
    const user = req.user.id;
    const { id } = req.params;

    if (isNaN(bidAmount)) {
      return res.status(400).json({ message: "Invalid bid amount" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Auction not found" });

    // Prevent seller from bidding on their own auction
    if (product.seller.toString() === user) {
      return res
        .status(403)
        .json({ message: "You cannot bid on your own auction" });
    }

    if (new Date(product.itemEndDate) < new Date())
      return res.status(400).json({ message: "Auction has already ended" });

    const minBid = Math.max(product.currentPrice, product.startingPrice) + 1;
    if (!Number.isFinite(bidAmount) || bidAmount < minBid) {
      return res
        .status(400)
        .json({ message: `Bid must be at least Rs ${minBid}` });
    }

    const previousLeadingBid =
      product.bids && product.bids.length > 0
        ? product.bids[product.bids.length - 1]
        : null;
    const previousLeadingBidderId = previousLeadingBid?.bidder?.toString();

    const updated = await Product.findOneAndUpdate(
      {
        _id: id,
        currentPrice: product.currentPrice,
        itemEndDate: { $gt: new Date() },
      },
      {
        $set: { currentPrice: bidAmount },
        $push: { bids: { bidder: user, bidAmount } },
      },
      { new: true },
    );

    if (!updated) {
      return res
        .status(409)
        .json({ message: "Bid failed — price changed. Please try again." });
    }

    // Populate for the response and socket broadcast
    const populated = await Product.findById(id)
      .populate("seller", "name")
      .populate("bids.bidder", "name");

    populated.bids.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));

    // Broadcast to all socket users in this auction room
    try {
      const io = getIO();
      const bidderName =
        populated.bids.find((b) => b.bidder?._id?.toString() === user)?.bidder
          ?.name || "Someone";

      io.to(id).emit("auction:bidPlaced", {
        auction: populated,
        bidderName,
        bidderId: user,
        bidAmount,
      });

      // Notify displaced leading bidder
      if (previousLeadingBidderId && previousLeadingBidderId !== user) {
        io.to(`user:${previousLeadingBidderId}`).emit("auction:outbid", {
          auctionId: id,
          itemName: product.itemName,
          newAmount: bidAmount,
          outbidBy: bidderName,
        });
      }
    } catch (socketErr) {
      console.error("Socket broadcast error:", socketErr.message);
    }

    res
      .status(200)
      .json({ message: "Bid placed successfully", auction: populated });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error placing bid", error: error.message });
  }
};

export const dashboardData = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const dateNow = new Date();
    const stats = await Product.aggregate([
      {
        $facet: {
          totalAuctions: [{ $count: "count" }],
          userAuctionCount: [
            { $match: { seller: userObjectId } },
            { $count: "count" },
          ],
          activeAuctions: [
            {
              $match: {
                itemStartDate: { $lte: dateNow },
                itemEndDate: { $gte: dateNow },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const totalAuctions = stats[0].totalAuctions[0]?.count || 0;
    const userAuctionCount = stats[0].userAuctionCount[0]?.count || 0;
    const activeAuctions = stats[0].activeAuctions[0]?.count || 0;

    const globalAuction = await Product.find({ itemEndDate: { $gt: dateNow } })
      .populate("seller", "name")
      .sort({ createdAt: -1 })
      .limit(4);
    const latestAuctions = globalAuction.map((item) => ({
      _id: item._id,
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      currentPrice: item.currentPrice,
      bidsCount: item.bids.length,
      timeLeft: Math.max(0, new Date(item.itemEndDate) - new Date()),
      itemCategory: item.itemCategory,
      sellerName: item.seller.name,
      itemPhoto: item.itemImage?.url,
    }));

    const userAuction = await Product.find({ seller: userObjectId })
      .populate("seller", "name")
      .sort({ createdAt: -1 })
      .limit(4);
    const latestUserAuctions = userAuction.map((item) => ({
      _id: item._id,
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      currentPrice: item.currentPrice,
      bidsCount: item.bids.length,
      timeLeft: Math.max(0, new Date(item.itemEndDate) - new Date()),
      itemCategory: item.itemCategory,
      sellerName: item.seller.name,
      itemPhoto: item.itemImage?.url,
    }));

    return res.status(200).json({
      totalAuctions,
      userAuctionCount,
      activeAuctions,
      latestAuctions,
      latestUserAuctions,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting dashboard data", error: error.message });
  }
};

export const myAuction = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = { seller: req.user.id };
    const total = await Product.countDocuments(filter);

    const auction = await Product.find(filter)
      .populate("seller", "name")
      .select(
        "itemName itemDescription currentPrice bids itemEndDate itemCategory itemImage seller",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const formatted = auction.map((item) => ({
      _id: item._id,
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      currentPrice: item.currentPrice,
      bidsCount: item.bids.length,
      timeLeft: Math.max(0, new Date(item.itemEndDate) - new Date()),
      itemCategory: item.itemCategory,
      sellerName: item.seller.name,
      itemPhoto: item.itemImage?.url,
    }));

    res.status(200).json({
      auctions: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching auctions", error: error.message });
  }
};

export const myBids = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const filter = { "bids.bidder": userId };
    const total = await Product.countDocuments(filter);

    const auction = await Product.find(filter)
      .populate("seller", "name")
      .populate("winner", "name")
      .select(
        "itemName itemDescription currentPrice bids itemEndDate itemCategory itemImage seller winner isSold",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formatted = auction.map((item) => {
      const isExpired = new Date(item.itemEndDate) < new Date();
      let winner = null;
      if (item.winner) {
        winner = { _id: item.winner._id, name: item.winner.name };
      } else if (isExpired && item.bids && item.bids.length > 0) {
        const sorted = [...item.bids].sort((a, b) => b.bidAmount - a.bidAmount);
        const topBid = sorted[0];
        winner = {
          _id: topBid.bidder?._id || topBid.bidder,
          name: topBid.bidder?.name || "Winning Bidder",
        };
      }

      return {
        _id: item._id,
        itemName: item.itemName,
        itemDescription: item.itemDescription,
        currentPrice: item.currentPrice,
        bidsCount: item.bids.length,
        timeLeft: Math.max(0, new Date(item.itemEndDate) - new Date()),
        itemCategory: item.itemCategory,
        sellerName: item.seller?.name || "Seller",
        itemPhoto: item.itemImage?.url,
        isExpired,
        winner,
        isSold: item.isSold || (isExpired && item.bids && item.bids.length > 0),
      };
    });

    res.status(200).json({
      auctions: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching my bids", error: error.message });
  }
};

export const generateAuctionAIListing = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required for AI listing generation",
      });
    }

    const listingDetails = await analyzeAuctionImage(imageUrl);

    return res.status(200).json({
      success: true,
      message: "Listing details generated successfully",
      data: listingDetails,
    });
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate auction details with AI",
    });
  }
};

export const getSimilarAuctions = async (req, res) => {
  try {
    const { id } = req.params;
    const currentProduct = await Product.findById(id).select(
      "+embedding itemCategory itemName",
    );
    if (!currentProduct) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const now = new Date();
    // Fetch active candidate auctions excluding the current one
    let candidateAuctions = await Product.find({
      _id: { $ne: currentProduct._id },
      itemEndDate: { $gt: now },
    })
      .select(
        "+embedding itemName itemDescription currentPrice startingPrice bids itemEndDate itemCategory itemImage seller",
      )
      .populate("seller", "name")
      .limit(40);

    // If no active auctions exist, return empty array immediately
    if (candidateAuctions.length === 0) {
      return res.status(200).json({
        success: true,
        similarAuctions: [],
      });
    }

    let scored = [];
    const hasCurrentEmbedding =
      Array.isArray(currentProduct.embedding) &&
      currentProduct.embedding.length > 0;

    if (hasCurrentEmbedding) {
      scored = candidateAuctions.map((item) => {
        let score = 0;
        if (
          Array.isArray(item.embedding) &&
          item.embedding.length === currentProduct.embedding.length
        ) {
          score = cosineSimilarity(currentProduct.embedding, item.embedding);
        } else if (item.itemCategory === currentProduct.itemCategory) {
          score = 0.45; // baseline category match score
        }
        return { item, score };
      });
      scored.sort((a, b) => b.score - a.score);
    } else {
      // Fallback: match by category
      scored = candidateAuctions
        .map((item) => ({
          item,
          score: item.itemCategory === currentProduct.itemCategory ? 1 : 0,
        }))
        .sort((a, b) => b.score - a.score);
    }

    const topSimilar = scored.slice(0, 4).map(({ item }) => ({
      _id: item._id,
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      currentPrice: item.currentPrice,
      startingPrice: item.startingPrice,
      bidsCount: item.bids?.length || 0,
      timeLeft: Math.max(0, new Date(item.itemEndDate) - now),
      itemCategory: item.itemCategory,
      sellerName: item.seller?.name || "Unknown",
      itemPhoto: item.itemImage?.url,
    }));

    return res.status(200).json({
      success: true,
      similarAuctions: topSimilar,
    });
  } catch (error) {
    console.error("Error finding similar auctions:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error finding similar auctions",
      error: error.message,
    });
  }
};

/**
 * Toggle an auction in the authenticated user's watchlist
 */
export const toggleWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const auction = await Product.findById(id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.watchlist)) {
      user.watchlist = [];
    }

    const index = user.watchlist.findIndex(
      (itemId) => itemId.toString() === id,
    );

    let isWatchlisted = false;
    if (index > -1) {
      user.watchlist.splice(index, 1);
      isWatchlisted = false;
    } else {
      user.watchlist.push(id);
      isWatchlisted = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      isWatchlisted,
      watchlist: user.watchlist,
      message: isWatchlisted
        ? "Added to your watchlist"
        : "Removed from your watchlist",
    });
  } catch (error) {
    console.error("Watchlist toggle error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating watchlist",
      error: error.message,
    });
  }
};

/**
 * Get all auctions in the user's watchlist
 */
export const getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));

    const user = await User.findById(userId).populate({
      path: "watchlist",
      populate: { path: "seller", select: "name" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const rawList = (user.watchlist || []).filter(Boolean);
    const total = rawList.length;
    const paginated = rawList.slice((page - 1) * limit, page * limit);

    const now = new Date();
    const formatted = paginated.map((item) => ({
      _id: item._id,
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      currentPrice: item.currentPrice,
      startingPrice: item.startingPrice,
      bidsCount: item.bids?.length || 0,
      timeLeft: Math.max(0, new Date(item.itemEndDate) - now),
      itemCategory: item.itemCategory,
      sellerName: item.seller?.name || "Unknown",
      itemPhoto: item.itemImage?.url,
      itemEndDate: item.itemEndDate,
    }));

    return res.status(200).json({
      success: true,
      watchlist: formatted,
      watchlistIds: rawList.map((item) => item._id),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching watchlist",
      error: error.message,
    });
  }
};

/**
 * Safe deletion of an auction (Sellers allowed if 0 bids; Admins allowed unconditionally)
 */
export const deleteAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const auction = await Product.findById(id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const isSeller = auction.seller.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isSeller && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to delete this auction.",
      });
    }

    // Sellers cannot delete auctions that have bids
    if (isSeller && !isAdmin && auction.bids && auction.bids.length > 0) {
      return res.status(400).json({
        message: "Cannot delete an auction that already has active bids.",
      });
    }

    // Clean up image from Cloudinary if possible
    if (auction.itemImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(auction.itemImage.public_id);
      } catch (cloudErr) {
        console.warn("Cloudinary delete warning:", cloudErr.message);
      }
    }

    await Product.findByIdAndDelete(id);

    // Remove from any watchlists
    await User.updateMany({ watchlist: id }, { $pull: { watchlist: id } });

    return res.status(200).json({
      success: true,
      message: "Auction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting auction:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting auction",
      error: error.message,
    });
  }
};


