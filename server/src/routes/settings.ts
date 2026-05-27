import { Router } from "express";
import {
  addActivityLog,
  findUserById,
  getAllUsers,
  getSettings,
  saveSettings,
  updateUserName,
} from "../data/store.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", (req, res) => {
  const user = findUserById(req.user!.userId);
  const userSettings = getSettings(req.user!.userId);

  res.json({
    profile: {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      avatar: user?.avatar,
      createdAt: user?.createdAt,
    },
    settings: userSettings,
  });
});

router.patch("/", (req, res) => {
  const user = findUserById(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { name, theme, emailNotifications, twoFactorEnabled, language, timezone } =
    req.body as Record<string, unknown>;

  if (typeof name === "string" && name.trim()) {
    updateUserName(user.id, name.trim());
    user.name = name.trim();
  }

  const userSettings = getSettings(req.user!.userId);

  if (theme === "light" || theme === "dark" || theme === "system") {
    userSettings.theme = theme;
  }
  if (typeof emailNotifications === "boolean") {
    userSettings.emailNotifications = emailNotifications;
  }
  if (typeof twoFactorEnabled === "boolean") {
    userSettings.twoFactorEnabled = twoFactorEnabled;
  }
  if (typeof language === "string") {
    userSettings.language = language;
  }
  if (typeof timezone === "string") {
    userSettings.timezone = timezone;
  }

  saveSettings(req.user!.userId, userSettings);

  addActivityLog({
    userId: req.user!.userId,
    userName: req.user!.name,
    action: "UPDATE_SETTINGS",
    resource: "settings",
    ip: (req.headers["x-forwarded-for"] as string) || "unknown",
    status: "success",
  });

  res.json({
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    settings: userSettings,
  });
});

router.get("/users", requireRole("admin"), (_req, res) => {
  res.json({
    users: getAllUsers().map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
    })),
  });
});

export default router;
