import rateLimit from "express-rate-limit";

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const max = Number(process.env.RATE_LIMIT_MAX) || 100;

/** Global API rate limit — protects all /api routes */
export const apiLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
    retryAfter: Math.ceil(windowMs / 1000),
  },
});

/** Stricter limit for auth endpoints (brute-force protection) */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please wait 15 minutes.",
    code: "AUTH_RATE_LIMIT",
  },
});
