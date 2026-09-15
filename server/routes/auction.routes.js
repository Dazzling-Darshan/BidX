import express from "express";
import {
  createAuction,
  showAuction,
  auctionById,
  placeBid,
  dashboardData,
  myAuction,
  myBids,
  generateAuctionAIListing,
  getSimilarAuctions,
  toggleWatchlist,
  getWatchlist,
  deleteAuction,
  leaveAuction,
} from "../controllers/auction.controller.js";
import { secureRoute } from "../middleware/auth.middleware.js";

const auctionRoutes = express.Router();
auctionRoutes.use(secureRoute);

auctionRoutes.post("/ai-generate", generateAuctionAIListing);

auctionRoutes.get("/stats", dashboardData);

auctionRoutes
  .route("/")
  .get(showAuction)
  .post(createAuction);

auctionRoutes.get("/myauction", myAuction);
auctionRoutes.get("/mybids", myBids);
auctionRoutes.get("/watchlist", getWatchlist);

auctionRoutes.get("/:id/similar", getSimilarAuctions);
auctionRoutes.post("/:id/watchlist", toggleWatchlist);
auctionRoutes.get("/:id", auctionById);
auctionRoutes.post("/:id/leave", leaveAuction);
auctionRoutes.post("/:id/bid", placeBid);
auctionRoutes.delete("/:id", deleteAuction);

export default auctionRoutes;
