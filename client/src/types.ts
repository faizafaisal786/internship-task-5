export type Role = "admin" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  ip: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  twoFactorEnabled: boolean;
  language: string;
  timezone: string;
}

export interface AnalyticsOverview {
  kpis: {
    totalRevenue: number;
    revenueChange: number;
    activeUsers: number;
    usersChange: number;
    conversionRate: number;
    conversionChange: number;
    apiCalls: number;
    apiChange: number;
  };
  revenueChart: { month: string; revenue: number; users: number; churn: number }[];
  trafficBySource: { source: string; visits: number; color: string }[];
  planDistribution: { plan: string; count: number }[];
  recentMetrics: {
    avgSessionDuration: string;
    bounceRate: string;
    mrr: string;
    nps: number;
  };
}
