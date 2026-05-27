import { v4 as uuid } from "uuid";
import { getDb } from "../db/database.js";

const db = () => getDb();
import type { ActivityLog, User, UserSettings } from "../types.js";

const now = () => new Date().toISOString();

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  password_hash: string;
  avatar: string | null;
  created_at: string;
}

interface SettingsRow {
  user_id: string;
  theme: "light" | "dark" | "system";
  email_notifications: number;
  two_factor_enabled: number;
  language: string;
  timezone: string;
}

interface LogRow {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  ip: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    passwordHash: row.password_hash,
    avatar: row.avatar ?? undefined,
    createdAt: row.created_at,
  };
}

function rowToSettings(row: SettingsRow): UserSettings {
  return {
    userId: row.user_id,
    theme: row.theme,
    emailNotifications: Boolean(row.email_notifications),
    twoFactorEnabled: Boolean(row.two_factor_enabled),
    language: row.language,
    timezone: row.timezone,
  };
}

function rowToLog(row: LogRow): ActivityLog {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    action: row.action,
    resource: row.resource,
    ip: row.ip,
    timestamp: row.timestamp,
    status: row.status,
  };
}

export function findUserByEmail(email: string): User | undefined {
  const row = db()
    .prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)")
    .get(email) as UserRow | undefined;
  return row ? rowToUser(row) : undefined;
}

export function findUserById(id: string): User | undefined {
  const row = db().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? rowToUser(row) : undefined;
}

export function getAllUsers(): User[] {
  const rows = db().prepare("SELECT * FROM users ORDER BY created_at").all() as UserRow[];
  return rows.map(rowToUser);
}

export function updateUserName(userId: string, name: string): void {
  db().prepare("UPDATE users SET name = ? WHERE id = ?").run(name, userId);
}

export function getSettings(userId: string): UserSettings {
  const row = db().prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId) as
    | SettingsRow
    | undefined;

  if (row) return rowToSettings(row);

  const defaults: UserSettings = {
    userId,
    theme: "system",
    emailNotifications: true,
    twoFactorEnabled: false,
    language: "en",
    timezone: "UTC",
  };

  db()
    .prepare(
      `INSERT INTO user_settings (user_id, theme, email_notifications, two_factor_enabled, language, timezone)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(userId, defaults.theme, 1, 0, defaults.language, defaults.timezone);

  return defaults;
}

export function saveSettings(userId: string, settings: UserSettings): void {
  db()
    .prepare(
      `INSERT INTO user_settings (user_id, theme, email_notifications, two_factor_enabled, language, timezone)
       VALUES (@userId, @theme, @emailNotifications, @twoFactorEnabled, @language, @timezone)
       ON CONFLICT(user_id) DO UPDATE SET
       theme = excluded.theme,
       email_notifications = excluded.email_notifications,
       two_factor_enabled = excluded.two_factor_enabled,
       language = excluded.language,
       timezone = excluded.timezone`
  ).run({
    userId,
    theme: settings.theme,
    emailNotifications: settings.emailNotifications ? 1 : 0,
    twoFactorEnabled: settings.twoFactorEnabled ? 1 : 0,
    language: settings.language,
    timezone: settings.timezone,
  });
}

export function addActivityLog(
  log: Omit<ActivityLog, "id" | "timestamp"> & { timestamp?: string }
): ActivityLog {
  const entry: ActivityLog = {
    id: uuid(),
    timestamp: log.timestamp ?? now(),
    ...log,
  };

  db()
    .prepare(
      `INSERT INTO activity_logs (id, user_id, user_name, action, resource, ip, timestamp, status)
       VALUES (@id, @userId, @userName, @action, @resource, @ip, @timestamp, @status)`
    )
    .run({
    id: entry.id,
    userId: entry.userId,
    userName: entry.userName,
    action: entry.action,
    resource: entry.resource,
    ip: entry.ip,
    timestamp: entry.timestamp,
    status: entry.status,
  });

  const count = db().prepare("SELECT COUNT(*) as c FROM activity_logs").get() as { c: number };
  if (count.c > 200) {
    db()
      .prepare(
      `DELETE FROM activity_logs WHERE id NOT IN (
        SELECT id FROM activity_logs ORDER BY timestamp DESC LIMIT 200
      )`
    ).run();
  }

  return entry;
}

export function queryActivityLogs(options: {
  userId?: string;
  status?: string;
  search?: string;
  page: number;
  limit: number;
}): { items: ActivityLog[]; total: number } {
  const conditions: string[] = [];
  const params: Record<string, string | number> = {
    limit: options.limit,
    offset: (options.page - 1) * options.limit,
  };

  if (options.userId) {
    conditions.push("user_id = @userId");
    params.userId = options.userId;
  }
  if (options.status) {
    conditions.push("status = @status");
    params.status = options.status;
  }
  if (options.search) {
    conditions.push(
      "(LOWER(action) LIKE @q OR LOWER(resource) LIKE @q OR LOWER(user_name) LIKE @q)"
    );
    params.q = `%${options.search.toLowerCase()}%`;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const total = db()
    .prepare(`SELECT COUNT(*) as c FROM activity_logs ${where}`)
    .get(params) as { c: number };

  const rows = db()
    .prepare(
      `SELECT * FROM activity_logs ${where} ORDER BY timestamp DESC LIMIT @limit OFFSET @offset`
    )
    .all(params) as LogRow[];

  return { items: rows.map(rowToLog), total: total.c };
}

export function getActivityStats(): {
  total: number;
  last24h: number;
  errors: number;
  warnings: number;
} {
  const total = db().prepare("SELECT COUNT(*) as c FROM activity_logs").get() as { c: number };
  const last24h = db()
    .prepare(
      `SELECT COUNT(*) as c FROM activity_logs WHERE timestamp >= datetime('now', '-1 day')`
    )
    .get() as { c: number };
  const errors = db()
    .prepare(`SELECT COUNT(*) as c FROM activity_logs WHERE status = 'error'`)
    .get() as { c: number };
  const warnings = db()
    .prepare(`SELECT COUNT(*) as c FROM activity_logs WHERE status = 'warning'`)
    .get() as { c: number };

  return {
    total: total.c,
    last24h: last24h.c,
    errors: errors.c,
    warnings: warnings.c,
  };
}
