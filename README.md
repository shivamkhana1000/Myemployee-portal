# MyEmployee Portal

> A fictional employee IT-support + continuous-improvement (Gamba) platform, 
> inspired by manufacturing workflows. Built incrementally as a full-stack prototype.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + React Router + Tailwind CSS v4 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL with raw SQL *(Phase 2+)* |
| Auth | Employee ID + Password, JWT, Role-Based *(Phase 2+)* |

---

## Project Structure

```
MyEmployee-Portal/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   │   └── layout/   # Navbar, Layout shell
│   │   ├── pages/        # Route-level page components
│   │   ├── services/     # API fetch wrappers (no raw fetch in components)
│   │   │   └── api/
│   │   ├── hooks/        # Custom React hooks (added in later phases)
│   │   ├── context/      # React context providers (added in later phases)
│   │   └── types/        # Shared TypeScript interfaces (added in later phases)
│   └── index.html
│
└── server/          # Express + TypeScript backend
    └── src/
        ├── routes/       # Express routers — thin, only map URL → controller
        ├── controllers/  # Request/response handling — delegates to services
        └── services/     # Business logic — no HTTP knowledge here
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL *(required only from Phase 2 onwards)*

---

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### 2. Environment Variables

**Server:**

```bash
cd server
copy .env.example .env   # Windows
# Edit .env and fill in your values
```

Key variables (see [`server/.env.example`](./server/.env.example)):

| Variable | Description |
|----------|-------------|
| `PORT` | Port the Express server listens on (default: `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_ORIGIN` | CORS allowed origin (default: `http://localhost:5173`) |
| `DATABASE_URL` | PostgreSQL connection string *(Phase 2+)* |
| `JWT_SECRET` | Long random string for signing JWTs *(Phase 2+)* |

---

### 3. Run in Development

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# → Express running on http://localhost:5000
# → Health check: http://localhost:5000/api/health
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# → Vite running on http://localhost:5173
# → Proxies /api/* to http://localhost:5000
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Returns server status, uptime, and environment |

**Example response:**
```json
{
  "success": true,
  "message": "MyEmployee Portal API is healthy",
  "timestamp": "2026-09-27T15:00:00.000Z",
  "uptime": 42,
  "environment": "development"
}
```

---

## Build Phases

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ Done | Project skeleton, Express health-check, React home page |
| **Phase 2** | ⏳ Next | Auth — JWT login, role-based guard, protected routes |
| **Phase 3** | ⏳ | IT Support Ticket CRUD |
| **Phase 4** | ⏳ | Gamba / Continuous Improvement module |
| **Phase 5** | ⏳ | Manager dashboard & KPI views |

---

## Scripts

### Server (`cd server`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with `ts-node-dev` (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled JS from `dist/` |
| `npm run lint` | ESLint check |

### Client (`cd client`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production bundle to `dist/` |
| `npm run preview` | Serve production bundle locally |
| `npm run lint` | ESLint check |
