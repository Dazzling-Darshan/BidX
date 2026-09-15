import express from "express";
import {
  handleGetUser,
  handleChangePassword,
  getLoginHistory,
  updateAvatar,
  updateProfile,
} from "../controllers/user.controller.js";
import { secureRoute } from "../middleware/auth.middleware.js";

const userRoutes = express.Router();

userRoutes.use(secureRoute);

userRoutes.route("/").get(handleGetUser).patch(handleChangePassword);
userRoutes.patch("/avatar", updateAvatar);
userRoutes.patch("/profile", updateProfile);
userRoutes.get("/logins", getLoginHistory);

export default userRoutes;
