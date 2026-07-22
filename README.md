# BidX

A modern, real-time full-stack auction platform built with React, Express, MongoDB, and Socket.io.

---

## Features

### 🔐 Authentication & Security
- Signup/Login with email/password
- JWT-based auth with HTTP-only cookies
- Password hashing with bcrypt
- User role management (user/admin)
- Login history tracking
- Auto-login on app startup

### 🏷️ Auctions
- Create auctions with images (upload via Cloudinary)
- Real-time bidding via Socket.io
- Pagination for browsing auctions
- View your own auctions and bids
- Auto-calculate winner when auction ends
- Bid validation (prevent seller from bidding, min/max bids, etc.)

### 👤 User Dashboard
- Personal dashboard with stats
- Login history
- Change password
- Edit profile

### 🛡️ Admin Panel
- View all users
- Dashboard with global stats

---

## Tech Stack

### Backend
- Node.js + Express 5
- MongoDB + Mongoose ODM
- Socket.io for real-time communication
- Cloudinary for image hosting
- JWT for authentication
- Multer for file uploads
- Node-cron for background jobs

### Frontend
- React 19 (Vite build tool)
- Tailwind CSS for styling
- TanStack React Query for server state
- Redux Toolkit for client state
- React Router for navigation
- Socket.io-client for real-time updates
- React Hot Toast for notifications

---

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)

### Setup Instructions

#### 1. Clone the repo
```bash
git clone <repo-url>
cd online-auction-system
```

#### 2. Server setup
```bash
cd server
npm install

# Create .env file
cat > .env << 'EOF'
PORT=4000
NODE_ENV=development
ORIGIN=http://localhost:5173
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/auction-db
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
COOKIE_DOMAIN=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=cloudinary://<api-key>:<api-secret>@<cloud-name>
RESEND_API_KEY=
EOF

# Replace environment variables with your actual values!

# Start server
npm run dev
```

#### 3. Client setup
```bash
cd ../client
npm install

# Create .env file
cat > .env << 'EOF'
VITE_API=http://localhost:4000/api
VITE_AUCTION_API=http://localhost:4000/api/auction
VITE_SOCKET_URL=http://localhost:4000
EOF

# Start dev server
npm run dev
```

Now you're ready to use the app at http://localhost:5173 !

---

## Project Structure

```
online-auction-system/
├── client/
│   ├── src/
│   │   ├── api/          # API utility functions
│   │   ├── components/   # Reusable React components
│   │   ├── config/       # Axios and Socket.io config
│   │   ├── hooks/        # Custom hooks (including React Query)
│   │   ├── init/         # Auth initialization component
│   │   ├── layout/       # Page layouts
│   │   ├── pages/        # App pages
│   │   ├── routers/      # Route definitions
│   │   ├── services/     # Service layer
│   │   └── store/        # Redux store
│   └── package.json
└── server/
    ├── config/           # Database and env config
    ├── controllers/      # Request handlers
    ├── middleware/       # Express middleware
    ├── models/           # Mongoose schemas
    ├── routes/           # API routes
    ├── services/         # Service layer
    ├── socket/           # Socket.io event handlers
    ├── utils/            # Utilities
    └── package.json
```

---

## API Documentation

See `server/README.md` for full API and Socket.io documentation.

---

## Notes for Deployment
- Make sure to set `NODE_ENV=production` in production
- Set `ORIGIN` to your frontend URL
- Set `COOKIE_DOMAIN` if needed for cross-subdomain cookies
- Set proper environment variables for Cloudinary and MongoDB

---

## License
This project is provided as-is for learning purposes.
