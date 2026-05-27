import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload, Role } from "../types.js";

const JWT_SECRET = process.env.JWT_SECRET || "saas-dashboard-dev-secret-change-me";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token", code: "INVALID_TOKEN" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: "Insufficient permissions",
        code: "FORBIDDEN",
        required: roles,
      });
      return;
    }
    next();
  };
}
