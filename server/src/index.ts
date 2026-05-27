import "dotenv/config";
import { createApp } from "./app.js";
import { initDatabase } from "./db/database.js";

initDatabase();

const app = createApp();
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`SaaS Dashboard API running on http://localhost:${PORT}`);
});
