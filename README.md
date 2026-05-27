# Nexus SaaS Dashboard

A full-stack SaaS dashboard built for **Internship Task 5**, featuring role-based authentication, analytics charts, activity logs, a settings panel, and API rate limiting.

![Stack](https://img.shields.io/badge/React-18-61dafb)
![Stack](https://img.shields.io/badge/Express-4-000000)
![Stack](https://img.shields.io/badge/TypeScript-5-3178c6)
![Stack](https://img.shields.io/badge/Tailwind-3-38bdf8)

## Features

| Feature | Description |
|---------|-------------|
| **Role-based login** | JWT auth with `admin` and `user` roles; protected routes and role-gated API endpoints |
| **Analytics charts** | Revenue area chart, traffic bar chart, plan distribution pie chart, KPI cards |
| **Activity logs** | Searchable audit trail; admins see all users, users see only their own activity |
| **Settings panel** | Profile, theme, notifications, 2FA toggle; admin user management table |
| **API rate limiting** | Global limit (100 req / 15 min) + stricter auth limit (10 login attempts / 15 min) |

## Demo Accounts

| Role  | Email            | Password  |
|-------|------------------|-----------|
| Admin | admin@saas.com   | admin123  |
| User  | user@saas.com    | user123   |

## Project Structure

```
internship-5/
├── client/          # React + Vite + Tailwind + Recharts
├── server/          # Express + TypeScript + JWT + Rate Limiting
├── package.json     # Root scripts to run both apps
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Install & Run

```bash
# From internship-5 folder
npm install
npm run install:all

# Start API + frontend together
npm run dev
```

- **Frontend:** http://localhost:5173  
- **API:** http://localhost:5000/api/health  

Or run separately:

```bash
npm run dev:server   # API on :5000
npm run dev:client   # UI on :5173
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/login` | — | Login (rate limited) |
| GET | `/api/auth/me` | JWT | Current user |
| POST | `/api/auth/logout` | JWT | Logout + audit log |
| GET | `/api/analytics/overview` | JWT | Dashboard metrics |
| GET | `/api/activity` | JWT | Activity logs (filtered by role) |
| GET | `/api/activity/stats` | Admin | Log statistics |
| GET/PATCH | `/api/settings` | JWT | Profile & preferences |
| GET | `/api/settings/users` | Admin | List all users |

## Gemini AI (optional)

Add your key to **`server/.env`** only (never commit this file):

```env
GEMINI_API_KEY=your-key-here
```

The dashboard **AI Insights** card calls Gemini through the backend so the key never reaches the browser. Use `server/.env.example` as a template.

## Rate Limiting

Configured in `server/.env`:

- `RATE_LIMIT_MAX=100` — max requests per window for all `/api/*` routes
- Auth routes use a separate **10 requests / 15 minutes** limit to prevent brute-force attacks

When exceeded, the API returns `429` with code `RATE_LIMIT_EXCEEDED`.

## Improvements (v1.1)

- **SQLite database** — users, settings, and activity logs persist in `server/data/saas.db` (survives server restart)
- **Live theme switching** — Light / Dark / System in Settings applies instantly across the UI
- **API tests** — run `npm test` from project root (Vitest + Supertest)

## Tech Stack

**Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, React Router, Lucide icons  

**Backend:** Express, TypeScript, JWT, bcrypt, express-rate-limit, CORS

## Build for Production

```bash
npm run build
cd server && npm start
cd client && npm run preview
```

---

Built as part of the internship portfolio — Task 5: SaaS Dashboard.
