import { env } from "../config/env.config.js";

/**
 * Validates whether an incoming request origin is allowed.
 * Supports:
 * - The primary configured ORIGIN (e.g. from Render dashboard)
 * - The production Vercel domain (https://bidx-zeta.vercel.app)
 * - Any Vercel branch/preview deployment (https://*.vercel.app)
 * - Localhost development ports
 */
export const isOriginAllowed = (origin) => {
  // Allow non-browser requests (no origin header, e.g. curl, postman, server-to-server)
  if (!origin) return true;

  const allowedOrigins = [
    env.origin,
    "https://bidx-zeta.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4000",
  ].filter(Boolean);

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow any Vercel preview deployment for this project
  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith(".vercel.app")) {
      return true;
    }
  } catch (err) {
    return false;
  }

  return false;
};
