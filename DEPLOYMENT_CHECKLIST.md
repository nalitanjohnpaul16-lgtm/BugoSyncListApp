# ✅ Render Production Deployment Checklist

**Barangay Bugo Resident Assistance Management System**

Use this checklist to ensure a smooth production deployment to Render.

---

## 📦 Pre-Deployment (Local)

### Build Verification

- [ ] Run `npm install` successfully
- [ ] Run `npx prisma generate` successfully
- [ ] Run `npm run build` successfully
- [ ] Verify `dist/index.html` exists
- [ ] Verify `dist/server.mjs` exists
- [ ] Verify `dist/assets/` directory exists
- [ ] Run `npm test` - all 34 tests pass (100%)
- [ ] Run `npm run lint` - zero TypeScript errors

**Quick Check:**
```bash
./scripts/prepare-production.sh     # Linux/Mac
# OR
.\scripts\prepare-production.ps1    # Windows
```

---

## 🔐 Secrets Generation

Generate all required secrets before deployment:

- [ ] Generate `JWT_SECRET` (64 characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

- [ ] Generate `HMAC_SECRET` (64 characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

- [ ] Generate strong `SEED_ADMIN_PASSWORD`
  ```bash
  node -e "console.log(require('crypto').randomBytes(16).toString('base64') + '!@#')"
  ```

- [ ] Generate strong `SEED_RESIDENT_PASSWORD`
  ```bash
  node -e "console.log(require('crypto').randomBytes(16).toString('base64') + '!@#')"
  ```

- [ ] Save all secrets securely (password manager recommended)

---

## 🗄️ Database Setup

### MySQL Database Provisioning

- [ ] Create MySQL 8.0+ database instance
  - **Options:** Render PostgreSQL, PlanetScale, AWS RDS, Railway, DigitalOcean
- [ ] Note database connection string
- [ ] Verify SSL/TLS is enabled
- [ ] Test connection from local machine
- [ ] Format connection string with SSL:
  ```
  mysql://username:password@host:port/barangay_bugo_db?sslaccept=strict
  ```

---

## 🌐 Render Service Setup

### Repository Setup

- [ ] Push code to GitHub/GitLab
- [ ] Verify `render.yaml` is in repository root
- [ ] Verify all code is committed

### Create Render Web Service

- [ ] Go to Render Dashboard
- [ ] Click "New +" → "Blueprint" (or "Web Service")
- [ ] Connect GitHub/GitLab repository
- [ ] Select Barangay Bugo repository
- [ ] Render detects `render.yaml`
- [ ] Review configuration:
  - Service name: `bugo-sync-list`
  - Region: `Singapore`
  - Plan: `Starter` (or higher)
  - Build command: `npm ci && npx prisma generate && npm run build`
  - Start command: `npm start`

---

## ⚙️ Environment Variables Configuration

Configure these in **Render Dashboard → Environment**:

### Required Variables

- [ ] `NODE_ENV` = `production`
- [ ] `FORCE_HTTPS` = `true`
- [ ] `LOG_LEVEL` = `info`
- [ ] `APP_URL` = `https://bugosynclistapp.onrender.com`
- [ ] `CORS_ORIGIN` = `https://bugosynclistapp.onrender.com`
- [ ] `DATABASE_URL` = `mysql://user:pass@host:port/db?sslaccept=strict`
- [ ] `JWT_SECRET` = `eScDqi1VfOHZ2vjWIRg6PGud3LF5ypAsJxbtT7rwomBUY8h0NEMz4KXlaQnCk9`
- [ ] `JWT_EXPIRES_IN` = `2h`
- [ ] `BCRYPT_ROUNDS` = `12`
- [ ] `HMAC_SECRET` = `o5OKILiT1H864rVpwz0vtEFCXkGR9SgZDseWBJmQaPA2nxfyljcYNUM73qdhub`
- [ ] `SEED_ADMIN_PASSWORD` = `<your-strong-password>`
- [ ] `SEED_RESIDENT_PASSWORD` = `<your-strong-password>`

### Optional Variables

- [ ] `GEMINI_API_KEY` = `<your-gemini-key>` (optional - for AI ID verification)

**Note:** Do NOT set `PORT` - Render injects this automatically

---

## 🚀 Deployment

### Initial Deploy

- [ ] Click "Deploy" or "Create Web Service"
- [ ] Monitor build logs in Render Dashboard
- [ ] Wait for build to complete (3-5 minutes)
- [ ] Verify service shows "Live" status

### Build Verification

- [ ] Build logs show: "Building..."
- [ ] Build logs show: "npm ci" completed
- [ ] Build logs show: "npx prisma generate" completed
- [ ] Build logs show: "npm run build" completed
- [ ] Build logs show: "Deploy succeeded"
- [ ] Service status: "Live"

---

## 🗃️ Database Initialization

### Run Migrations

**Option A: Render Shell**
- [ ] Go to service → Shell tab
- [ ] Run: `npx prisma migrate deploy`
- [ ] Verify: "All migrations have been successfully applied"

**Option B: Local Machine**
- [ ] Set `DATABASE_URL` to production database
- [ ] Run: `npx prisma migrate deploy`
- [ ] Verify migrations applied

### Seed Initial Data

- [ ] Run: `npm run prisma:seed` (first time only)
- [ ] Verify: "Seed complete: 2 users, 57 services, 10 census puroks"
- [ ] Check database has data:
  ```sql
  SELECT COUNT(*) FROM users;              -- Should be 2
  SELECT COUNT(*) FROM assistance_programs; -- Should be 57
  SELECT COUNT(*) FROM census_puroks;      -- Should be 10
  ```

---

## ✅ Verification & Testing

### Health Checks

- [ ] Visit: `https://your-service-name.onrender.com/api/health`
- [ ] Response shows: `"status": "ok"`
- [ ] Response shows: `"database.mode": "mysql-prisma"`
- [ ] Response shows: `"database.connected": true`

### Deployment Status

- [ ] Visit: `https://your-service-name.onrender.com/api/deployment/status`
- [ ] Response shows: `"status": "operational"`
- [ ] Response shows: `"environment": "production"`
- [ ] Response shows: `"persistenceMode": "mysql-prisma"`

### HTTPS & Security

- [ ] HTTP request redirects to HTTPS (301)
- [ ] Valid SSL certificate (no browser warnings)
- [ ] Security headers present:
  - [ ] `Strict-Transport-Security`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `Content-Security-Policy`

### Authentication

- [ ] Admin login works:
  ```bash
  curl -X POST https://your-service.onrender.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@bugo.gov.ph","password":"<SEED_ADMIN_PASSWORD>"}'
  ```
- [ ] JWT token returned
- [ ] Token can access protected endpoints

### API Endpoints

- [ ] GET `/api/programs` returns 57 programs
- [ ] GET `/api/applications` returns applications (with auth)
- [ ] GET `/api/announcements` returns announcements
- [ ] GET `/api/database/schema` returns 8 tables
- [ ] POST `/api/auth/register` works for new users

### Frontend

- [ ] Visit: `https://your-service-name.onrender.com`
- [ ] Page loads without errors
- [ ] Login form appears
- [ ] Can login as admin
- [ ] Can login as resident
- [ ] Dashboard loads correctly
- [ ] Maps render (OpenStreetMap)
- [ ] No console errors in browser
- [ ] All features accessible

---

## 💾 Backup Configuration

### Manual Backup

- [ ] Test backup command:
  ```bash
  npm run db:backup
  ```
- [ ] Verify backup file created in `backups/`
- [ ] Check backup file size is reasonable

### Automated Backup (Optional)

- [ ] Create Render Cron Job for daily backups
- [ ] Name: `barangay-bugo-backup`
- [ ] Command: `npm run db:backup`
- [ ] Schedule: `0 2 * * *` (daily at 2 AM UTC)
- [ ] Configure backup storage (S3, Cloudflare R2, etc.)

---

## 🔄 Post-Deployment Tasks

### Security Hardening

- [ ] Login as admin immediately
- [ ] Change admin password from seed default
- [ ] Create additional admin accounts if needed
- [ ] Review user permissions

### Credential Rotation

- [ ] (Optional) Remove `SEED_ADMIN_PASSWORD` from environment
- [ ] (Optional) Remove `SEED_RESIDENT_PASSWORD` from environment
- [ ] Document new admin credentials securely

### Monitoring Setup

- [ ] Enable Render email notifications
- [ ] Set up UptimeRobot or similar (free uptime monitoring)
- [ ] Configure Slack integration (optional)
- [ ] Set up error alerting

### Documentation

- [ ] Document production URL
- [ ] Document admin credentials (securely)
- [ ] Document database connection details
- [ ] Update README with production info

---

## 🎯 Custom Domain (Optional)

If using a custom domain:

- [ ] Go to Render Dashboard → Settings → Custom Domains
- [ ] Add custom domain (e.g., `assist.barangaybugo.gov.ph`)
- [ ] Add DNS CNAME record pointing to Render
- [ ] Wait for DNS propagation (up to 24 hours)
- [ ] Update `APP_URL` environment variable
- [ ] Update `CORS_ORIGIN` environment variable
- [ ] Trigger redeploy
- [ ] Verify SSL certificate auto-provisioned
- [ ] Test custom domain access

---

## 🐛 Troubleshooting

If issues occur, check:

- [ ] Render build logs for errors
- [ ] Render runtime logs for errors
- [ ] Database connection string format
- [ ] All environment variables set correctly
- [ ] Health check endpoint accessible
- [ ] Database migrations applied
- [ ] Seed data loaded
- [ ] No hardcoded `PORT` in code
- [ ] `trust proxy` enabled in server.ts

---

## 📊 Performance Monitoring

### Week 1 After Launch

- [ ] Monitor CPU usage
- [ ] Monitor memory usage
- [ ] Monitor request count
- [ ] Monitor error rate
- [ ] Check response times
- [ ] Review database query performance

### Ongoing

- [ ] Weekly backup verification
- [ ] Monthly security updates
- [ ] Quarterly dependency updates
- [ ] User feedback collection

---

## ✅ Deployment Complete!

When all items are checked:

- ✅ Service is live and accessible
- ✅ HTTPS enabled with valid certificate
- ✅ Database connected and populated
- ✅ All API endpoints functional
- ✅ Frontend fully operational
- ✅ Authentication working
- ✅ Security headers active
- ✅ Backups configured
- ✅ Monitoring enabled

**Your Barangay Bugo system is now in production!** 🎉

---

## 📚 Reference Documents

- `RENDER_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `DEPLOYMENT.md` - Original deployment documentation
- `.env.production.template` - Environment variable template
- `FINAL_TEST_REPORT.md` - Complete test results (100% pass)
- `DATABASE_SETUP_COMPLETE.md` - Database setup guide
- `QUICK_START.md` - Quick start for developers

---

**Deployment Date:** __________________  
**Deployed By:** __________________  
**Production URL:** __________________  
**Status:** ✅ COMPLETE

