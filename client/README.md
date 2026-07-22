# Auction Platform — Frontend

React 19 SPA with real-time bidding via Socket.io, TanStack React Query, Redux Toolkit auth, Tailwind CSS v4.

---

## Getting Started

```bash
cd client
npm install
```

Create a `.env` file:

```env
VITE_API=http://localhost:3000
VITE_AUCTION_API=http://localhost:3000/auction
```

Start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## Project Structure

```
src/
├── main.jsx
├── index.css
├── config/
│   ├── api.js          → Axios instance
│   └── socket.js       → Socket.io singleton
├── store/
│   └── auth/authSlice.js
├── services/           → API call functions
├── hooks/              → React Query hooks
├── layout/             → Protected / Public / Admin layouts
├── routers/            → Route definitions
├── components/         → Reusable UI components
└── pages/              → App pages
```

---

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API` | Yes | Backend API base URL |
| `VITE_AUCTION_API` | Yes | Auction API base URL |

---

## Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `vite --host` | Dev server with HMR |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview production build |

---

## Tech Stack

| Library | Version | Purpose |
| --- | --- | --- |
| React | 19.1.0 | UI framework |
| Vite | 6.3.5 | Build tool |
| Tailwind CSS | 4.1.7 | Styling |
| React Router | 7.6.1 | Routing |
| Redux Toolkit | 2.8.2 | Auth state |
| TanStack React Query | 5.77.2 | Server state |
| Axios | 1.9.0 | HTTP client |
| Socket.io Client | 4.8.3 | Real-time |
| react-hot-toast | 2.6.0 | Notifications |
