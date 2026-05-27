import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { seedDatabase } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../../data");

let db: Database.Database;

function getDbPath(): string {
  if (process.env.DB_PATH) return process.env.DB_PATH;
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "saas.db");
}

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(getDbPath());
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function initDatabase(): void {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      password_hash TEXT NOT NULL,
      avatar TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      theme TEXT NOT NULL DEFAULT 'system',
      email_notifications INTEGER NOT NULL DEFAULT 1,
      two_factor_enabled INTEGER NOT NULL DEFAULT 0,
      language TEXT NOT NULL DEFAULT 'en',
      timezone TEXT NOT NULL DEFAULT 'UTC'
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      ip TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('success', 'warning', 'error'))
    );

    CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_logs(timestamp DESC);
  `);

  const { count } = database.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };

  if (count === 0) {
    seedDatabase(database);
  }
}
