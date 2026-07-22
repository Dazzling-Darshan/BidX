# Auction Platform — Backend

Express 5 REST API + Socket.io real-time bidding server with MongoDB, JWT auth, and Cloudinary uploads.

---

## Getting Started

```bash
cd server
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables)), then:

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`.

---

## Project Structure

```
server/
├── server.js          → HTTP server + Socket.io + graceful shutdown
├── app.js             → Express app (middleware, routes, CORS)
├── index.js           → Vercel serverless export
├── config/
│   ├── db.config.js   → MongoDB connection
│   └── env.config.js  → Environment variable validation
├── routes/            → Route definitions
├── controllers/       → Business logic
├── models/            → Mongoose schemas (User, Product, Login)
├── socket/            → Socket.io init + auction handlers
├── middleware/        → Auth middleware
├── services/          → Cloudinary integration
└── utils/             → JWT, cookies, geo-location
```

---

## Environment Variables

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `PORT` | No | Server port (default: 4000) | `3000` |
| `NODE_ENV` | No | Environment | `production` |
| `ORIGIN` | **Yes** | Frontend URL for CORS | `http://localhost:5173` |
| `MONGO_URL` | **Yes** | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | **Yes** | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) | `7d` |
| `COOKIE_DOMAIN` | No | Cookie domain (production only) | `.yourdomain.com` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name | `my-cloud` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret | `abc-xyz` |
| `CLOUDINARY_URL` | Yes | Full Cloudinary URL | `cloudinary://...` |
| `RESEND_API_KEY` | Yes | Resend email service key | `re_xxx` |

---

## API Reference

Base URL: `http://localhost:3000`

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/signup` | Register new user |
| `POST` | `/auth/login` | Login (sets httpOnly cookie) |
| `POST` | `/auth/logout` | Logout (clears cookie) |

### User

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/user` | Get current user profile | Required |
| `PATCH` | `/user` | Change password | Required |
| `GET` | `/user/logins` | Login history (last 10) | Required |

### Auctions

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/auction` | List auctions (paginated) | Required |
| `POST` | `/auction` | Create auction | Required |
| `GET` | `/auction/stats` | Dashboard statistics | Required |
| `GET` | `/auction/myauction` | User's own auctions | Required |
| `GET` | `/auction/mybids` | Auctions user has bid on | Required |
| `GET` | `/auction/:id` | Single auction detail | Required |
| `POST` | `/auction/:id/bid` | Place a bid | Required |

### Admin

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/admin/dashboard` | Admin statistics | Admin |
| `GET` | `/admin/users` | List users | Admin |

### Upload

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/upload/signature` | Signed Cloudinary upload params | Required |

### Contact

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/contact` | Submit contact form |

---

## Socket.io Events

| Event | Direction | Payload |
| --- | --- | --- |
| `auction:join` | Client → Server | `{ auctionId }` |
| `auction:leave` | Client → Server | `{ auctionId }` |
| `auction:bid` | Client → Server | `{ auctionId, bidAmount }` |
| `auction:userJoined` | Server → Room | `{ userName, userId, activeUsers[] }` |
| `auction:userLeft` | Server → Room | `{ userName, userId, activeUsers[] }` |
| `auction:bidPlaced` | Server → Room | `{ auction, bidderName, bidAmount }` |
| `auction:error` | Server → Client | `{ message }` |

---

## Database Models

### User
- `name`, `email`, `password` (bcrypt), `avatar`, `role` (user/admin)
- `ipAddress`, `location`, `lastLogin`

### Product (Auction)
- `itemName`, `itemDescription`, `itemCategory`, `itemImage`
- `startingPrice`, `currentPrice`, `itemStartDate`, `itemEndDate`
- `seller`, `bids[]`, `winner`, `isSold`

### Login History
- `userId`, `ipAddress`, `location`, `loginAt` (TTL: ~6 months)
