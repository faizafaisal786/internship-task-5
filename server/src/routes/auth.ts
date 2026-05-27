import { Router } from "express";
import bcrypt from "bcryptjs";
import { addActivityLog, findUserByEmail } from "../data/store.js";
import { authenticate, signToken } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = findUserByEmail(email);
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    if (user) {
      addActivityLog({
        userId: user.id,
        userName: user.name,
        action: "FAILED_LOGIN",
        resource: "auth",
        ip,
        status: "error",
      });
    }
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  addActivityLog({
    userId: user.id,
    userName: user.name,
    action: "LOGIN",
    resource: "auth",
    ip,
    status: "success",
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", authenticate, (req, res) => {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  addActivityLog({
    userId: req.user!.userId,
    userName: req.user!.name,
    action: "LOGOUT",
    resource: "auth",
    ip,
    status: "success",
  });
  res.json({ message: "Logged out successfully" });
});

export default router;
