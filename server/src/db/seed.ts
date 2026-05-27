import type Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
};

export function seedDatabase(db: Database.Database): void {
  const adminHash = bcrypt.hashSync("admin123", 10);
  const userHash = bcrypt.hashSync("user123", 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, role, password_hash, avatar, created_at)
    VALUES (@id, @email, @name, @role, @passwordHash, @avatar, @createdAt)
  `);

  const insertSettings = db.prepare(`
    INSERT INTO user_settings (user_id, theme, email_notifications, two_factor_enabled, language, timezone)
    VALUES (@userId, @theme, @emailNotifications, @twoFactorEnabled, @language, @timezone)
  `);

  const insertLog = db.prepare(`
    INSERT INTO activity_logs (id, user_id, user_name, action, resource, ip, timestamp, status)
    VALUES (@id, @userId, @userName, @action, @resource, @ip, @timestamp, @status)
  `);

  const seed = db.transaction(() => {
    insertUser.run({
      id: "u-admin-001",
      email: "admin@saas.com",
      name: "Alex Morgan",
      role: "admin",
      passwordHash: adminHash,
      avatar: "AM",
      createdAt: "2024-01-15T10:00:00.000Z",
    });
    insertUser.run({
      id: "u-user-002",
      email: "user@saas.com",
      name: "Jordan Lee",
      role: "user",
      passwordHash: userHash,
      avatar: "JL",
      createdAt: "2024-03-22T14:30:00.000Z",
    });

    insertSettings.run({
      userId: "u-admin-001",
      theme: "dark",
      emailNotifications: 1,
      twoFactorEnabled: 1,
      language: "en",
      timezone: "America/New_York",
    });
    insertSettings.run({
      userId: "u-user-002",
      theme: "system",
      emailNotifications: 1,
      twoFactorEnabled: 0,
      language: "en",
      timezone: "Europe/London",
    });

    const logs = [
      { userId: "u-admin-001", userName: "Alex Morgan", action: "LOGIN", resource: "auth", ip: "192.168.1.10", days: 0, hour: 9, status: "success" },
      { userId: "u-user-002", userName: "Jordan Lee", action: "VIEW_DASHBOARD", resource: "analytics", ip: "10.0.0.45", days: 0, hour: 11, status: "success" },
      { userId: "u-admin-001", userName: "Alex Morgan", action: "UPDATE_SETTINGS", resource: "settings", ip: "192.168.1.10", days: 1, hour: 14, status: "success" },
      { userId: "u-user-002", userName: "Jordan Lee", action: "EXPORT_REPORT", resource: "reports", ip: "10.0.0.45", days: 1, hour: 16, status: "success" },
      { userId: "u-user-002", userName: "Jordan Lee", action: "FAILED_LOGIN", resource: "auth", ip: "203.0.113.8", days: 2, hour: 3, status: "error" },
      { userId: "u-admin-001", userName: "Alex Morgan", action: "DELETE_USER", resource: "users", ip: "192.168.1.10", days: 3, hour: 10, status: "warning" },
      { userId: "u-admin-001", userName: "Alex Morgan", action: "API_KEY_ROTATED", resource: "api", ip: "192.168.1.10", days: 4, hour: 15, status: "success" },
      { userId: "u-user-002", userName: "Jordan Lee", action: "UPDATE_PROFILE", resource: "profile", ip: "10.0.0.45", days: 5, hour: 9, status: "success" },
    ];

    for (const log of logs) {
      insertLog.run({
        id: uuid(),
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        resource: log.resource,
        ip: log.ip,
        timestamp: daysAgo(log.days, log.hour),
        status: log.status,
      });
    }
  });

  seed();
  console.log("Database seeded with demo users and activity logs.");
}
