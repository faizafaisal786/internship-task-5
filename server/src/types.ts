export type Role = "admin" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
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
  userId: string;
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  twoFactorEnabled: boolean;
  language: string;
  timezone: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
