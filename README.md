# 🚀 Nexus SaaS Dashboard - Elite Analytics Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDEF?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.0-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Pro-4285F4?logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

Nexus is a state-of-the-art, full-stack SaaS dashboard designed for high-performance data visualization and user management. Built as the flagship project for **Internship Task 5**, it integrates advanced security, real-time analytics, and AI-driven insights into a seamless user experience.

---

## ✨ Key Features

### 🔐 Enterprise-Grade Security
- **Role-Based Access Control (RBAC):** Granular permissions for `Admin` and `User` roles.
- **Secure Authentication:** JWT-based sessions with hashed password storage (bcrypt).
- **Intelligent Rate Limiting:** Global and auth-specific protection against brute-force attacks.

### 📊 Advanced Analytics
- **Dynamic Charts:** Interactive revenue flows, traffic patterns, and user distribution using **Recharts**.
- **Real-time KPIs:** Instant visibility into critical business metrics.
- **AI-Driven Insights:** Integrated with **Google Gemini Pro** to provide automated analysis of your data.

### 🛠️ Professional Management
- **Audit Trails:** Comprehensive activity logs with advanced filtering and search.
- **User Administration:** Full control over user accounts and settings (Admin only).
- **Live Customization:** Instant theme switching (Light/Dark/System) and profile management.

### 💾 Robust Architecture
- **Persistent Storage:** SQLite database for reliable data management across restarts.
- **Type Safety:** End-to-end TypeScript for a bug-free development experience.
- **Clean Code:** Highly modular structure following industry best practices.

---

## 🏗️ Project Architecture

```text
📦 internship-5
├── 🎨 client             # React + Vite Frontend
│   ├── 🧩 components     # Reusable UI primitives
│   ├── 📑 pages          # Dashboard, Activity, Settings
│   └── 🧪 context        # State management (Auth/Theme)
├── ⚙️ server             # Express + Node.js Backend
│   ├── 🛣️ routes         # API endpoint definitions
│   ├── 🛡️ middleware     # Auth, Security, Validation
│   └── 🤖 services       # External integrations (Gemini)
└── 📦 data               # SQLite persistent storage
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js:** v18.0 or higher
- **Package Manager:** npm (v9+)

### Installation

1. **Clone & Install Dependencies:**
   ```bash
   # Install root and both workspace dependencies
   npm install
   npm run install:all
   ```

2. **Configure Environment:**
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_key
   GEMINI_API_KEY=your_google_gemini_key
   ```

3. **Launch Development Environment:**
   ```bash
   # Starts both Client (5173) and Server (5000)
   npm run dev
   ```

---

## 🔐 Test Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@saas.com` | `admin123` |
| **Standard User** | `user@saas.com` | `user123` |

---

## 🔌 API Documentation

| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | None | Identity verification & JWT issuance |
| `GET` | `/api/analytics` | JWT | Fetching dashboard data points |
| `GET` | `/api/activity` | JWT | Role-filtered audit logs |
| `PATCH` | `/api/settings` | JWT | Updating user preferences |
| `GET` | `/api/insights` | JWT | Gemini-powered data analysis |

---

## 🧪 Testing & Validation

Maintain high code quality with our integrated test suite:

```bash
# Run backend API tests
npm test
```

---

## 🛠️ Built With

- **Frontend:** React, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, JWT, SQLite, Gemini AI SDK
- **Testing:** Vitest, Supertest

---

<div align="center">
  <p><i>Developed with ❤️ for the Internship Portfolio — 2024</i></p>
</div>
