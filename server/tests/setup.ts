import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDb = path.join(__dirname, "test-saas.db");

if (fs.existsSync(testDb)) fs.unlinkSync(testDb);

process.env.DB_PATH = testDb;
process.env.JWT_SECRET = "test-secret";
process.env.RATE_LIMIT_MAX = "10000";
