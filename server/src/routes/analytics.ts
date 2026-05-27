import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { addActivityLog } from "../data/store.js";

const router = Router();

router.use(authenticate);

function generateRevenue(months = 12) {
  const data = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en", { month: "short" });
    data.push({
      month: label,
      revenue: Math.round(42000 + Math.random() * 28000 + i * 1200),
      users: Math.round(1200 + Math.random() * 400 + i * 45),
      churn: Number((2 + Math.random() * 2.5).toFixed(1)),
    });
  }
  return data;
}

const trafficBySource = [
  { source: "Organic", visits: 12400, color: "#6366f1" },
  { source: "Paid Ads", visits: 8200, color: "#8b5cf6" },
  { source: "Referral", visits: 5100, color: "#06b6d4" },
  { source: "Social", visits: 3900, color: "#10b981" },
  { source: "Email", visits: 2800, color: "#f59e0b" },
];

const planDistribution = [
  { plan: "Free", count: 8420 },
  { plan: "Starter", count: 3210 },
  { plan: "Pro", count: 1890 },
  { plan: "Enterprise", count: 420 },
];

router.get("/overview", (req, res) => {
  const isAdmin = req.user!.role === "admin";

  addActivityLog({
    userId: req.user!.userId,
    userName: req.user!.name,
    action: "VIEW_ANALYTICS",
    resource: "analytics",
    ip: (req.headers["x-forwarded-for"] as string) || "unknown",
    status: "success",
  });

  res.json({
    kpis: {
      totalRevenue: isAdmin ? 487320 : 12450,
      revenueChange: isAdmin ? 12.4 : 8.2,
      activeUsers: isAdmin ? 13940 : 1,
      usersChange: isAdmin ? 5.8 : 0,
      conversionRate: isAdmin ? 3.42 : 2.1,
      conversionChange: isAdmin ? -0.3 : 0.4,
      apiCalls: isAdmin ? 2847291 : 1240,
      apiChange: isAdmin ? 18.2 : 12.0,
    },
    revenueChart: generateRevenue(),
    trafficBySource: isAdmin ? trafficBySource : trafficBySource.slice(0, 3),
    planDistribution: isAdmin ? planDistribution : [{ plan: "Pro", count: 1 }],
    recentMetrics: {
      avgSessionDuration: "4m 32s",
      bounceRate: "38.2%",
      mrr: isAdmin ? "$42,180" : "$99",
      nps: isAdmin ? 62 : 0,
    },
  });
});

export default router;
