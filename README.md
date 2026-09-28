# MyEmployee Portal

[![CI](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml)

> **IT Support & Continuous Improvement (Kaizen / Gamba) Management Portal**  
> An enterprise-inspired full-stack web application designed for industrial/manufacturing plant workflows, featuring role-based access control (RBAC), SLA deadline calculation, knowledge-base solution suggestions, and automated CI/CD validation.

---

> [!NOTE]  
> **Disclaimer:** This project is an **independent prototype and portfolio project** inspired by manufacturing and continuous-improvement workflows. It is **not** an official Honda or HMSI (Honda Motorcycle and Scooter India) system, nor is it affiliated with, endorsed by, or sponsored by Honda Motor Co., Ltd. or HMSI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router v7 |
| **Backend** | Node.js (LTS) + Express + TypeScript |
| **Database** | PostgreSQL (Neon serverless in dev, throwaway service container in CI) |
| **Auth & Security** | JWT (JSON Web Tokens), bcryptjs password hashing, role-based middleware (Employee vs. Manager) |
| **CI / Automation** | GitHub Actions (automated linting, database migrations, tests, production builds) |
| **Testing** | Jest + Supertest (integration + unit test suites) |

---

## Key Features

- **Authentication & RBAC:** Secure JWT authentication with strict role-based separation between Employees (raise tickets, submit Gamba proposals) and Managers (assign, update status, approve Gamba projects).
- **IT Support Ticket Management:**
  - Automated SLA deadline assignment based on severity (Low = +72h, Medium = +48h, High = +24h, Critical = +4h).
  - Dynamic overdue status detection for unresolved issues.
  - Interactive discussion thread comments on each ticket.
- **AI-Assisted Solution Suggestions:** Real-time debounced search against historical resolution records to recommend known fixes before ticket submission.
- **Continuous Improvement (Gamba / Kaizen):** Multi-stage review workflow (`draft` → `submitted` → `under_review` → `approved` / `changes_requested` → `implemented` → `completed`) with strict role-enforced state transitions.
- **Enterprise Error Hardening:** Centralized global error handling ensuring internal infrastructure exceptions (such as database connection or authentication failures) never leak sensitive details or SQL state codes to clients.

---

## Project Structure

```
MyEmployee-Portal/
├── .github/
│   └── workflows/
│       └── ci.yml        # GitHub Actions continuous integration pipeline
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components & layout shell
│   │   ├── context/      # Auth & application state context
│   │   ├── pages/        # Route views (Login, Tickets, Gamba, Dashboard)
│   │   ├── services/     # API fetch clients (no inline fetch calls)
│   │   └── types/        # TypeScript interfaces and contracts
│   ├── package.json
│   └── vite.config.ts
├── server/               # Express + TypeScript backend
│   ├── src/
│   │   ├── controllers/  # Request / response orchestration
│   │   ├── db/           # Connection pool, schema.sql, seed scripts
│   │   ├── lib/          # Business rules (deadline calculation, Gamba state machines)
│   │   ├── middleware/   # JWT verification, RBAC guard, global error handling
│   │   ├── routes/       # Express route definitions
│   │   ├── services/     # Database queries & business logic
│   │   └── tests/        # Jest + Supertest unit and integration test suites
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## Running Locally

### Prerequisites

- **Node.js**: v18 or v20 LTS (v20 recommended)
- **npm**: v9 or higher
- **PostgreSQL**: A local PostgreSQL instance or a free cloud database (e.g., [Neon](https://neon.tech))

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
cd MyEmployee-Portal

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cd server
cp .env.example .env    # On Windows: copy .env.example .env
```

Configure the following variables in `server/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/myemployee_portal

# Long random string for JWT signing
JWT_SECRET=super_secret_jwt_key_min_32_characters_long
JWT_EXPIRES_IN=8h
```

### 3. Initialize the Database

Run migrations to apply the schema (`schema.sql`) and seed test users and reference data:

```bash
cd server
npm run db:setup
```

### 4. Start the Application

Open **two terminal windows**:

**Terminal 1 — Backend (Express API):**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
# Health check available at: http://localhost:5000/api/health
```

**Terminal 2 — Frontend (Vite + React):**
```bash
cd client
npm run dev
# Web application starts at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Demo Credentials

The database seed provides pre-configured accounts for testing both employee and manager workflows:

| Role | Employee ID | Password | Department | Permissions |
|------|------------|----------|------------|-------------|
| **Employee** | `EMP001` | `Employee@123` | Information Technology | Raise tickets, view personal tickets & Gamba projects |
| **Employee** | `EMP002` | `Employee@123` | Engineering | Raise tickets, view personal tickets & Gamba projects |
| **Employee** | `EMP003` | `Employee@123` | Production | Raise tickets, view personal tickets & Gamba projects |
| **Manager** | `MGR001` | `Manager@123` | Information Technology | View all tickets, update ticket status, review Gamba proposals |
| **Manager** | `MGR002` | `Manager@123` | Engineering | View all tickets, update ticket status, review Gamba proposals |

---

## Running Tests

The test suite covers pure business logic units (offline, zero DB dependencies) and full API integration tests with Supertest:

```bash
cd server

# Run the complete test suite (all 62 tests across 4 suites)
npm test

# Run pure unit tests only (fast, no database required)
npm run test:unit
```

### Test Suite Structure

1. **`business-rules.test.ts` (Unit Tests):**
   - SLA deadline calculations based on priority (`Low` = +72h, `Medium` = +48h, `High` = +24h, `Critical` = +4h).
   - Overdue calculation (past deadline + unresolved status).
   - Gamba state machine transitions (valid steps accepted, illegal jumps rejected for both employees and managers).
2. **`auth.test.ts` (API Integration Tests):**
   - Successful login returns signed JWT tokens.
   - Wrong password or unknown employee ID returns generic 401.
   - Missing fields validation (400).
   - Protected routes return 401 without valid Bearer token.
   - RBAC enforcement: employees get 403 when attempting manager-only endpoints.
3. **`tickets.test.ts` (API Integration Tests):**
   - Ticket creation validation and accurate deadline persistence.
   - Manager PATCH operations for ticket status and resolutions.
   - **Data isolation strategy:** Tests tag rows with run-scoped UUID markers (`[TEST:<uuid>]`) and clean up via `afterAll`, ensuring existing data remains completely untouched.
4. **`error-handling.test.ts` (Resilience Tests):**
   - Simulated database outage/authentication failure returns safe generic 500 without leaking raw SQL or connection strings.

---

## Continuous Integration (GitHub Actions)

Every push and pull request to the `main` branch is validated automatically via [`.github/workflows/ci.yml`](./.github/workflows/ci.yml):

- **Backend Job:**
  - Spins up a dedicated PostgreSQL 16 Alpine service container.
  - Caches npm dependencies for rapid execution.
  - Runs ESLint validation.
  - Runs database migrations and seed script against the CI container.
  - Executes the full Jest test suite with Supertest.
  - Compiles TypeScript to verify build correctness (`npm run build`).
- **Frontend Job:**
  - Caches npm dependencies.
  - Runs code linting.
  - Builds the production bundle (`npm run build`) via Vite.

---

## Available Scripts

### Backend (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reloading (`ts-node-dev`) |
| `npm run build` | Compile TypeScript into production JavaScript (`dist/`) |
| `npm start` | Run compiled server in production mode |
| `npm run lint` | Run ESLint checks on `src/` |
| `npm run db:migrate` | Execute `schema.sql` database migration |
| `npm run db:seed` | Seed database with demo users and knowledge base records |
| `npm run db:setup` | Run both migration and seeding in sequence |
| `npm test` | Run full test suite with Jest |
| `npm run test:unit` | Run unit tests only (no DB required) |

### Frontend (`client/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Type-check with `tsc` and create optimized production bundle |
| `npm run lint` | Run linter on frontend source code |
| `npm run preview` | Locally preview the built production bundle |
