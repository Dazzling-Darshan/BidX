import Product from "../models/product.model.js";

// Track users in auction rooms: { auctionId: Map<socketId, { userId, userName }> }
const auctionRooms = new Map();

export const registerAuctionHandlers = (io, socket) => {
  // Use verified identity from socket auth middleware
  const userId = socket.user.id;
  const userName = socket.user.name;

  // Join user's personal channel for private notifications (e.g. outbid alerts)
  socket.join(`user:${userId}`);

  // Join auction room
  socket.on("auction:join", (data) => {
    const auctionId = typeof data === "object" ? data?.auctionId : data;
    if (!auctionId) return;

    socket.join(auctionId);

    if (!auctionRooms.has(auctionId)) {
      auctionRooms.set(auctionId, new Map());
    }

    const room = auctionRooms.get(auctionId);

    // Evict any previous socket entries for this user in this room
    for (const [sId, u] of room.entries()) {
      if (u.userId === userId && sId !== socket.id) {
        room.delete(sId);
      }
    }

    room.set(socket.id, { userId, userName });

    // Broadcast to all users in room
    io.to(auctionId).emit("auction:userJoined", {
      userName,
      userId,
      activeUsers: getActiveUsers(io, auctionId),
    });

    console.log(`${userName} joined auction: ${auctionId}`);
  });

  // Leave auction room
  socket.on("auction:leave", (data) => {
    const auctionId = typeof data === "object" ? data?.auctionId : data;
    handleLeaveAuction(io, socket, auctionId);
  });

  // Place bid via socket — uses authenticated userId, not client-supplied
  socket.on("auction:bid", async ({ auctionId, bidAmount }) => {
    try {
      if (!auctionId || bidAmount == null) return;

      // Coerce to number to prevent string comparison bugs
      const amount = Number(bidAmount);
      if (isNaN(amount)) {
        socket.emit("auction:error", { message: "Invalid bid amount" });
        return;
      }

      // Atomic findOneAndUpdate to prevent race conditions
      const product = await Product.findById(auctionId);
      if (!product) {
        socket.emit("auction:error", { message: "Auction not found" });
        return;
      }

      if (new Date(product.itemEndDate) < new Date()) {
        socket.emit("auction:error", {
          message: "Auction has already ended",
        });
        return;
      }

      // Prevent seller from bidding on own auction
      if (product.seller.toString() === userId.toString()) {
        socket.emit("auction:error", {
          message: "You cannot bid on your own auction",
        });
        return;
      }

      const minBid = Math.max(product.currentPrice, product.startingPrice) + 1;

      if (!Number.isFinite(amount) || amount < minBid) {
        socket.emit("auction:error", {
          message: `Bid must be at least Rs ${minBid}`,
        });
        return;
      }

      // Identify displaced leading bidder to notify them
      const previousLeadingBid =
        product.bids && product.bids.length > 0
          ? product.bids[product.bids.length - 1]
          : null;
      const previousLeadingBidderId = previousLeadingBid?.bidder?.toString();

      // Use findOneAndUpdate with price condition to prevent race conditions
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: auctionId,
          currentPrice: product.currentPrice, // Only update if price hasn't changed
          itemEndDate: { $gt: new Date() },
        },
        {
          $set: { currentPrice: amount },
          $push: {
            bids: {
              bidder: userId,
              bidAmount: amount,
            },
          },
        },
        { new: true },
      )
        .populate("seller", "name")
        .populate("bids.bidder", "name");

      if (!updatedProduct) {
        socket.emit("auction:error", {
          message: "Bid failed — price changed. Please try again.",
        });
        return;
      }

      updatedProduct.bids.sort(
        (a, b) => new Date(b.bidTime) - new Date(a.bidTime),
      );

      // Broadcast updated auction data to all users in the room
      io.to(auctionId).emit("auction:bidPlaced", {
        auction: updatedProduct,
        bidderName: userName,
        bidderId: userId,
        bidAmount: amount,
        message: `${userName} placed a bid of Rs ${amount}`,
      });

      // Emit outbid notification to displaced bidder if they are not the current bidder
      if (
        previousLeadingBidderId &&
        previousLeadingBidderId !== userId
      ) {
        io.to(`user:${previousLeadingBidderId}`).emit("auction:outbid", {
          auctionId,
          itemName: product.itemName,
          newAmount: amount,
          outbidBy: userName,
        });
      }
    } catch (error) {
      console.error("Socket bid error:", error.message);
      socket.emit("auction:error", {
        message: "Error placing bid",
      });
    }
  });

  // Cleanup on disconnecting (fires while rooms are still available)
  socket.on("disconnecting", () => {
    for (const roomName of socket.rooms) {
      if (roomName !== socket.id) {
        handleLeaveAuction(io, socket, roomName);
      }
    }
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    cleanupSocket(io, socket);
  });
};

export const removeUserFromAuction = (io, auctionId, userId, userName = null, socketId = null) => {
  if (!auctionId || !auctionRooms.has(auctionId)) return;

  const room = auctionRooms.get(auctionId);
  let resolvedName = userName;
  let removed = false;

  for (const [sId, u] of room.entries()) {
    if ((userId && u.userId === userId) || (socketId && sId === socketId)) {
      if (!resolvedName) resolvedName = u.userName;
      room.delete(sId);
      removed = true;
      const sock = io?.sockets?.sockets?.get(sId);
      if (sock) {
        try {
          sock.leave(auctionId);
        } catch (_) {}
      }
    }
  }

  // Remove empty room
  if (room.size === 0) {
    auctionRooms.delete(auctionId);
  }

  if (removed) {
    const remainingUsers = getActiveUsers(io, auctionId);
    io.to(auctionId).emit("auction:userLeft", {
      userName: resolvedName,
      userId,
      activeUsers: remainingUsers,
    });
    console.log(`${resolvedName || "User"} (${userId || socketId}) left auction: ${auctionId}. Remaining: ${remainingUsers.length}`);
  }
};

const handleLeaveAuction = (io, socket, auctionId) => {
  const targetId = typeof auctionId === "object" ? auctionId?.auctionId : auctionId;
  if (!targetId) return;
  removeUserFromAuction(io, targetId, socket.user?.id, socket.user?.name, socket.id);
};

const cleanupSocket = (io, socket) => {
  for (const [auctionId, room] of auctionRooms.entries()) {
    if (room.has(socket.id)) {
      removeUserFromAuction(io, auctionId, socket.user?.id, socket.user?.name, socket.id);
    }
  }
};

export const getActiveUsers = (io, auctionId) => {
  if (!auctionId || !auctionRooms.has(auctionId)) return [];

  const room = auctionRooms.get(auctionId);
  const users = [];
  const seen = new Set();
  const deadSocketIds = [];

  for (const [socketId, { userId, userName }] of room.entries()) {
    const liveSocket = io?.sockets?.sockets?.get(socketId);
    // If socket no longer exists or is not connected, treat as dead
    if (!liveSocket || !liveSocket.connected) {
      deadSocketIds.push(socketId);
      continue;
    }

    if (!seen.has(userId)) {
      seen.add(userId);
      users.push({ userId, userName });
    }
  }

  // Purge dead sockets from memory
  for (const deadId of deadSocketIds) {
    room.delete(deadId);
  }
  if (room.size === 0) {
    auctionRooms.delete(auctionId);
  }

  return users;
};
