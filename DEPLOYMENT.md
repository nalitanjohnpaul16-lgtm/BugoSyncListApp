# Bugo Sync List – Deployment & Operations Guide

**System:** Web-Based Resident Assistance Management System for Barangay Bugo, Cagayan de Oro City  
**Architecture:** React.js (Vite + TypeScript + Tailwind CSS) · Node.js + Express.js · MySQL · Prisma ORM · JWT · Bcrypt · RBAC

> **Optional Services Note:** Firebase Cloud Messaging (FCM) and Cloudinary file storage are **not implemented** in this codebase (notifications are persisted in the relational database notification queue, and document uploads use validated base64/file metadata checks). Placeholder keys remain commented out in `.env.example` should you add them in a future phase.

---

## A. Localhost Deployment (No Domain Required)

### 1. Prerequisites
- **Node.js** `v20+` or `v22+` and `npm` `v10+`
- **MySQL** `8.0+` (or **MariaDB** `10.6+`) running locally on `127.0.0.1:3306`

### 2. Create Local Database & User
Run inside your local `mysql` shell:
```sql
CREATE DATABASE IF NOT EXISTS barangay_bugo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'bugo_user'@'localhost' IDENTIFIED BY 'CHANGE_ME_LOCAL_DB_PASS';
GRANT ALL PRIVILEGES ON barangay_bugo_db.* TO 'bugo_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env` for localhost:
- Set `NODE_ENV="development"`
- Set `PORT="3000"`
- Set `APP_URL="http://localhost:3000"`
- Set `CORS_ORIGIN="http://localhost:3000"`
- Set `DATABASE_URL="mysql://bugo_user:CHANGE_ME_LOCAL_DB_PASS@127.0.0.1:3306/barangay_bugo_db"`
- Generate strong `JWT_SECRET` and `HMAC_SECRET`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

### 4. Install Dependencies, Migrate & Seed MySQL via Prisma
```bash
npm install
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
```
*(Fallback note: If `DATABASE_URL` is omitted during local evaluation, the server automatically operates in JSON local fallback mode via `data/db.json`, while full MySQL persistence activates automatically once `DATABASE_URL` is configured.)*

### 5. Starting and Stopping the System Locally
- **Start Development Server (React Vite + Express API on port 3000):**
  ```bash
  npm run dev
  ```
  Open `http://localhost:3000` in your browser.
- **Stop Development Server:**
  Press `Ctrl + C` in the terminal running `npm run dev`.
- **Start Local Production Simulation:**
  ```bash
  npm run build
  NODE_ENV=production npm start
  ```
- **Stop Production Server:**
  Press `Ctrl + C` (or `pm2 stop bugo-sync-list` if using PM2).

---

## B. Production Deployment Preparation

### 1. Build Artifacts
Running `npm run build` compiles:
1. Frontend static bundle into `dist/index.html` and `dist/assets/*` via Vite.
2. Backend Express server bundle into `dist/server.mjs` via `esbuild` (dynamically excludes Vite dev middleware in production so `npm ci --omit=dev` works cleanly).

### 2. Required Production Environment Variables
Configure these in your hosting platform's Secret / Environment dashboard (never commit `.env`):
- `NODE_ENV="production"`
- `PORT="3000"` *(or platform-assigned `PORT`, avoiding port `8080` if behind AI Studio proxy)*
- `APP_URL="https://<your-deployed-url>"`
- `CORS_ORIGIN="https://<your-deployed-url>"`
- `FORCE_HTTPS="true"` *(enforces HTTPS redirect behind reverse proxy via `X-Forwarded-Proto`)*
- `DATABASE_URL="mysql://<user>:<pass>@<prod-mysql-host>:3306/barangay_bugo_db?sslaccept=strict"`
- `JWT_SECRET="<64+ char random hex secret>"` *(server refuses production startup if missing or default)*
- `JWT_EXPIRES_IN="2h"`
- `BCRYPT_ROUNDS="12"`
- `HMAC_SECRET="<64+ char random hex secret>"` *(server refuses production startup if missing or default)*
- `SEED_ADMIN_PASSWORD` / `SEED_RESIDENT_PASSWORD` *(set strong initial credentials before seeding production DB, then rotate or remove)*

### 3. Production Prisma Migrations
On every production deployment release:
```bash
npx prisma generate
npx prisma migrate deploy
```
Only run `npm run prisma:seed` on initial empty database provisioning (uses idempotent `upsert`, safe against overwriting existing production users).

### 4. HTTPS / TLS & Security Hardening Active in `server.ts`
- **Helmet HTTP Security Headers**: Sets CSP, `X-Frame-Options`, `X-Content-Type-Options`, HSTS, etc.
- **Strict CORS Allowlist**: Restricts cross-origin requests exclusively to `CORS_ORIGIN` / `APP_URL`.
- **Trust Proxy & HTTPS Enforcement**: `app.set('trust proxy', 1)` + `FORCE_HTTPS="true"` redirects HTTP requests to HTTPS (`301`).
- **JWT & RBAC Middleware**:
  - `authenticateJWT` verifies `Authorization: Bearer <token>` via `jsonwebtoken`.
  - `requireRole('admin')` protects administrative actions (application approval/disqualification, voucher disbursement, resident verification/banning, profile change decisions, announcements, census updates, archive management).
  - `requireSelfOrAdmin` restricts resident mutations to their own user ID.
- **Bcrypt Hashing (`bcryptjs`)**: All new registrations, password changes, and Prisma seeds hash passwords using Bcrypt (configurable rounds, default `12`) while keeping legacy verification backward compatibility.
- **Brute-Force Rate Limiting**: 5 failed login attempts lock out an IP for 60 seconds.
- **Structured Error Logging & Monitoring**: Writes JSON error events to `stderr` and `logs/error.log` without leaking stack traces in production HTTP responses. `/api/health` exposes database connectivity, latency, and uptime for uptime monitors.

---

## C. Database Backups & Recovery Procedures

### Automated Backup (`mysqldump` + gzip + 14-day retention)
```bash
DATABASE_URL="mysql://user:pass@host:3306/barangay_bugo_db" bash scripts/backup_mysql.sh
```
Schedule daily at 2:00 AM PHT via cron on a VPS:
```cron
0 2 * * * cd /var/www/bugo-sync-list && . ./.env && /usr/bin/bash scripts/backup_mysql.sh >> logs/backup.log 2>&1
```
*(Managed MySQL hosts like Railway, Aiven, DigitalOcean Managed MySQL, and TiDB Cloud also provide automated daily point-in-time snapshots.)*

### Recovery / Restore Procedure
```bash
gunzip -c backups/barangay_bugo_YYYYMMDD_HHMMSS.sql.gz | \
  mysql -h <MYSQL_HOST> -P <MYSQL_PORT> -u <MYSQL_USER> -p barangay_bugo_db
```
After restoring, verify schema alignment with `npx prisma migrate status` and check `/api/health`.

---

## D. Hosting Recommendations & Custom Domain Guidance (Barangay Bugo)

### Does Barangay Bugo Need a Custom Domain?
**No — a custom domain is optional.**  
Hosting providers listed below automatically supply an HTTPS deployment URL (for example, `https://bugo-sync-list.up.railway.app` or `https://bugo-sync-list.onrender.com`). A custom domain (e.g., `assist.barangaybugo.gov.ph` via `.gov.ph` / `.ph`) is recommended only when Barangay Bugo LGU is ready to publish an official branded address, and can be attached via DNS CNAME/A records without code changes (just update `APP_URL` and `CORS_ORIGIN`).

### Verified Compatible Hosting Options (React + Node.js/Express + MySQL)
1. **Railway (Recommended All-in-One PaaS)**
   - **Why compatible:** Runs a single Node.js service (`npm run build` + `npm start`) + native managed **MySQL 8** service in the same private network, automatic HTTPS/TLS, and built-in environment variables.
2. **DigitalOcean App Platform + Managed MySQL (or Droplet VPS)**
   - **Why compatible:** Dedicated Node.js runtime + Managed MySQL 8 with automated daily backups and Singapore (`sgp1`) region close to Cagayan de Oro City for low latency.
   - **VPS Alternative (Ubuntu 22.04/24.04):** Node.js 22 + PM2 + MySQL 8 + **Nginx reverse proxy** + **Certbot (Let's Encrypt TLS)**.
3. **Render (Web Service) + Aiven for MySQL (Free/Managed Tier)**
   - **Why compatible:** Render hosts the unified Express + React static bundle (`npm run build` -> `npm start`) with automatic TLS; Aiven provides managed MySQL 8 with TLS (`?sslaccept=strict`).

*(Note: Pure static/serverless hosts like Vercel static-only or Netlify cannot host a persistent Express server + MySQL stateful architecture without rewriting Express routes into serverless functions.)*

---

## E. Step-by-Step Production Deployment Checklist
1. Provision MySQL 8 database and obtain `DATABASE_URL` (with TLS enabled).
2. Provision Node.js host (`>= 20.x`) and set all production environment variables (`NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `HMAC_SECRET`, `APP_URL`, `CORS_ORIGIN`, `FORCE_HTTPS=true`).
3. Deploy repository and run build + migrations:
   ```bash
   npm ci
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   ```
4. Seed initial data on first launch (`npm run prisma:seed` with secure `SEED_*_PASSWORD` vars).
5. Start server (`npm start` via `node dist/server.mjs`) behind HTTPS proxy / platform TLS.
6. Run verification suite against the deployed URL:
   ```bash
   VERIFY_BASE_URL="https://<your-deployed-url>" npm run verify:deploy
   ```
7. Confirm `/api/health` returns `status: "ok"`, `database.mode: "mysql-prisma"`, and `database.connected: true`.
8. Test Admin login, Resident login, RBAC enforcement, application creation, refresh persistence, and zero console/network errors.
