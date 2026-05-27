import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initDatabase } from "../src/db/database.js";

beforeAll(() => {
  initDatabase();
});

describe("SaaS Dashboard API", () => {
  const app = createApp();

  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /api/auth/login rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@saas.com", password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/login accepts admin demo user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@saas.com", password: "admin123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe("admin");
  });

  it("GET /api/analytics/overview requires auth", async () => {
    const res = await request(app).get("/api/analytics/overview");
    expect(res.status).toBe(401);
  });

  it("user role sees filtered activity logs", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@saas.com", password: "user123" });
    const token = login.body.token;

    const res = await request(app)
      .get("/api/activity")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items.every((l: { userId: string }) => l.userId === "u-user-002")).toBe(
      true
    );
  });

  it("PATCH /api/settings persists theme to SQLite", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@saas.com", password: "user123" });
    const token = login.body.token;

    const patch = await request(app)
      .patch("/api/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({ theme: "light" });
    expect(patch.status).toBe(200);
    expect(patch.body.settings.theme).toBe("light");

    const get = await request(app)
      .get("/api/settings")
      .set("Authorization", `Bearer ${token}`);
    expect(get.body.settings.theme).toBe("light");
  });
});
