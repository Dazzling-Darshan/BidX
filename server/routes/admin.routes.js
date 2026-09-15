import express from "express";
import {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllAuctions,
  adminDeleteAuction,
  getAllMessages,
  updateMessageStatus,
  deleteMessage,
} from "../controllers/admin.controller.js";
import { checkAdmin, secureRoute } from "../middleware/auth.middleware.js";

const adminRoutes = express.Router();
adminRoutes.use(secureRoute);
adminRoutes.use(checkAdmin);

// Dashboard
adminRoutes.get("/dashboard", getAdminDashboard);

// Users Management
adminRoutes.get("/users", getAllUsers);
adminRoutes.patch("/users/:id/role", updateUserRole);
adminRoutes.delete("/users/:id", deleteUser);

// Auctions Moderation
adminRoutes.get("/auctions", getAllAuctions);
adminRoutes.delete("/auctions/:id", adminDeleteAuction);

// Contact Inquiries / Messages
adminRoutes.get("/messages", getAllMessages);
adminRoutes.patch("/messages/:id/status", updateMessageStatus);
adminRoutes.delete("/messages/:id", deleteMessage);

export default adminRoutes;
