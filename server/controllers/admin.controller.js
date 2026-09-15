import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { cloudinary } from "../services/cloudinaryService.js";

export const getAdminDashboard = async (req, res) => {
  try {
    // Get statistics
    const totalAuctions = await Product.countDocuments();
    const activeAuctions = await Product.countDocuments({
      itemEndDate: { $gt: new Date() },
    });
    const totalUsers = await User.countDocuments();
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    const unreadMessages = await Message.countDocuments({ status: "unread" });
    const totalMessages = await Message.countDocuments();

    // Get recent active auctions for display
    const recentActiveAuctions = await Product.find({
      itemEndDate: { $gt: new Date() },
    })
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedRecentActiveAuctions = recentActiveAuctions.map(
      (auction) => ({
        ...auction,
        itemPhoto: auction.itemImage?.url || "",
      }),
    );

    // Get recent users for display
    const recentUsersList = await User.find({})
      .select("name email role createdAt lastLogin location avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      stats: {
        activeAuctions,
        totalAuctions,
        totalUsers,
        recentUsers,
        unreadMessages,
        totalMessages,
      },
      recentAuctions: formattedRecentActiveAuctions,
      recentUsersList: recentUsersList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching admin dashboard data",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || "";

    // Whitelist sortable fields to prevent sorting by sensitive fields like password
    const allowedSortFields = [
      "createdAt",
      "name",
      "email",
      "role",
      "lastLogin",
    ];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build search query — escape regex special chars to prevent ReDoS
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchQuery = escapedSearch
      ? {
          $or: [
            { name: { $regex: escapedSearch, $options: "i" } },
            { email: { $regex: escapedSearch, $options: "i" } },
          ],
        }
      : {};

    // Apply role filter if provided
    const roleFilter = role && ["user", "admin"].includes(role) ? { role } : {};

    const query = { ...searchQuery, ...roleFilter };

    // Get total count for pagination info
    const totalUsers = await User.countDocuments(query);

    // Get users with pagination, search, and sorting
    const users = await User.find(query)
      .select("name email role createdAt signupAt lastLogin location avatar")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

/**
 * Get all auctions across the platform with filtering, searching, and pagination
 */
export const getAllAuctions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const { status, category, search } = req.query;

    const filter = {};
    const now = new Date();

    if (status === "active") {
      filter.itemEndDate = { $gt: now };
    } else if (status === "ended") {
      filter.itemEndDate = { $lte: now };
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

    const totalAuctions = await Product.countDocuments(filter);

    const auctions = await Product.find(filter)
      .populate("seller", "name email")
      .populate("winner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedAuctions = auctions.map((auction) => ({
      ...auction,
      bidsCount: auction.bids?.length || 0,
      itemPhoto: auction.itemImage?.url || "",
      isExpired: new Date(auction.itemEndDate) <= now,
    }));

    const totalPages = Math.ceil(totalAuctions / limit);

    return res.status(200).json({
      success: true,
      data: {
        auctions: formattedAuctions,
        pagination: {
          currentPage: page,
          totalPages,
          totalAuctions,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin auctions:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching auctions",
      error: error.message,
    });
  }
};

/**
 * Admin delete auction with image & watchlist cleanup
 */
export const adminDeleteAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Product.findById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
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
    await User.updateMany({ watchlist: id }, { $pull: { watchlist: id } });

    return res.status(200).json({
      success: true,
      message: "Auction deleted successfully by admin",
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

/**
 * Update user role (admin <-> user) with self-demotion protection
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be 'user' or 'admin'",
      });
    }

    // Prevent admin from demoting themselves
    if (req.user.id === id && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own admin privileges.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating user role",
      error: error.message,
    });
  }
};

/**
 * Delete user account with self-deletion protection
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting their own account from admin panel
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user's auctions and remove their avatar if on Cloudinary
    if (user.avatar?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      } catch (_) {}
    }

    await Product.deleteMany({ seller: id });
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User and associated listings deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

/**
 * Get all contact messages with search, status filter, and pagination
 */
export const getAllMessages = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const filter = {};
    if (status && ["unread", "read"].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
        { subject: { $regex: escaped, $options: "i" } },
        { message: { $regex: escaped, $options: "i" } },
      ];
    }

    const totalMessages = await Message.countDocuments(filter);
    const unreadCount = await Message.countDocuments({ status: "unread" });

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalMessages / limit);

    return res.status(200).json({
      success: true,
      data: {
        messages,
        unreadCount,
        pagination: {
          currentPage: page,
          totalPages,
          totalMessages,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching contact messages",
      error: error.message,
    });
  }
};

/**
 * Update message read/unread status
 */
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["unread", "read"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'unread' or 'read'",
      });
    }

    const message = await Message.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Message marked as ${status}`,
      data: message,
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating message status",
      error: error.message,
    });
  }
};

/**
 * Delete a contact message
 */
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting message",
      error: error.message,
    });
  }
};

