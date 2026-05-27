import { Router } from "express";
import { queryActivityLogs, getActivityStats } from "../data/store.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", (req, res) => {
  const { page = "1", limit = "20", status, search } = req.query;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));

  const { items, total } = queryActivityLogs({
    userId: req.user!.role === "user" ? req.user!.userId : undefined,
    status: typeof status === "string" ? status : undefined,
    search: typeof search === "string" ? search : undefined,
    page: pageNum,
    limit: limitNum,
  });

  res.json({
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

router.get("/stats", requireRole("admin"), (_req, res) => {
  res.json(getActivityStats());
});

export default router;
