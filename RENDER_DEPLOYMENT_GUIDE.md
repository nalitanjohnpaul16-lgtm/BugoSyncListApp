# 🚀 Render Production Deployment Guide
## Barangay Bugo Resident Assistance Management System

**Complete Step-by-Step Guide for Production Deployment**

---

## 📋 Pre-Deployment Checklist

### Local Environment Verification

1. **Install Dependencies**
   ```bash
   cd BugoSyncList2026-main
   npm install
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Run Production Build Locally**
   ```bash
   npm run build
   ```
   
   **Expected Output:**
   - ✅ `dist/index.html` (Vite frontend build)
   - ✅ `dist/assets/` (CSS, JS, images)
   - ✅ `dist/server.mjs` (esbuild backend bundle)

4. **Verify Build Artifacts**
   ```bash
   # Check dist directory
   ls -la dist/
   
   # Verify index.html exists
   test -f dist/index.html && echo "✓ Frontend build OK"
   
   # Verify server.mjs exists
   test -f dist/server.mjs && echo "✓ Backend build OK"
   ```

---

## 🗄️ Phase 1: MySQL Database Setup (Production)

### Option A: Render MySQL

1. **Create MySQL Instance on Render**
   - Go to Render Dashboard → New → PostgreSQL (or external MySQL)
   - Select plan (Starter recommended for testing)
   - Note the connection string

2. **Configure SSL Connection**
   ```
   mysql://username:password@host:port/database?sslaccept=strict
   ```

### Option B: External MySQL Provider

Popular options:
- **PlanetScale** (Free tier, auto-scaling)
- **AWS RDS** (Reliable, scalable)
- **DigitalOcean Managed Databases**
- **Railway** (Developer-friendly)

**Required Configuration:**
- MySQL 8.0+
- Character set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`
- SSL/TLS enabled
- Public access enabled (with IP whitelist if needed)

---

## 🔐 Phase 2: Generate Production Secrets

### Generate Strong Secrets

Run these commands locally to generate secure random secrets:

```bash
# Generate JWT_SECRET (64 characters)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# Generate HMAC_SECRET (64 characters)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# Generate SEED_ADMIN_PASSWORD (strong password)
node -e "console.log(require('crypto').randomBytes(16).toString('base64') + '!@#')"

# Generate SEED_RESIDENT_PASSWORD (strong password)
node -e "console.log(require('crypto').randomBytes(16).toString('base64') + '!@#')"
```

**Save these values securely** - you'll need them for Render environment variables.

---

## 🌐 Phase 3: Deploy to Render

### Step 1: Push to GitHub/GitLab

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Production deployment ready"

# Push to GitHub (create repo first on GitHub)
git remote add origin https://github.com/YOUR_USERNAME/barangay-bugo-system.git
git push -u origin main
```

### Step 2: Create Render Web Service

1. **Go to Render Dashboard**
   - Click "New +" → "Blueprint" (recommended) or "Web Service"

2. **Connect GitHub Repository**
   - Select your Barangay Bugo repository
   - Render will detect `render.yaml`

3. **Review Blueprint Configuration**
   - Service Name: `bugo-sync-list`
   - Region: `Singapore` (closest to Cagayan de Oro)
   - Plan: `Starter` (upgrade as needed)
   - Build Command: `npm ci && npx prisma generate && npm run build`
   - Start Command: `npm start`

### Step 3: Configure Environment Variables

In Render Dashboard → Environment, add these variables:

#### Required Variables

```env
# Runtime Environment
NODE_ENV=production
FORCE_HTTPS=true
LOG_LEVEL=info

# Application URLs (replace with your Render URL)
APP_URL=https://your-service-name.onrender.com
CORS_ORIGIN=https://your-service-name.onrender.com

# Database Connection (add ?sslaccept=strict for SSL)
DATABASE_URL=mysql://username:password@host:port/barangay_bugo_db?sslaccept=strict

# Authentication Secrets (use generated values from Phase 2)
JWT_SECRET=<your-64-char-hex-secret>
JWT_EXPIRES_IN=2h
BCRYPT_ROUNDS=12
HMAC_SECRET=<your-64-char-hex-secret>

# Initial Database Seeding (use strong passwords)
SEED_ADMIN_PASSWORD=<your-strong-admin-password>
SEED_RESIDENT_PASSWORD=<your-strong-resident-password>
```

#### Optional Variables

```env
# AI ID Verification (optional - requires Google Gemini API key)
GEMINI_API_KEY=<your-gemini-api-key-if-available>
```

### Step 4: Deploy

1. Click "Deploy" or "Create Web Service"
2. Render will:
   - Clone your repository
   - Run `npm ci` (clean install)
   - Generate Prisma client
   - Build frontend and backend
   - Start the service

3. **Monitor Build Logs**
   - Watch for any errors
   - Build should complete in 3-5 minutes

---

## 🗃️ Phase 4: Initialize Production Database

### Option A: Using Render Shell

1. **Open Render Shell**
   - Go to your service → Shell tab
   - Wait for shell to connect

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Initial Data** (first time only)
   ```bash
   npm run prisma:seed
   ```

### Option B: From Local Machine

1. **Set Production DATABASE_URL**
   ```bash
   export DATABASE_URL="mysql://username:password@host:port/barangay_bugo_db?sslaccept=strict"
   ```

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Database** (if empty)
   ```bash
   npm run prisma:seed
   ```

---

## ✅ Phase 5: Verification & Testing

### 1. Check Service Health

```bash
curl https://your-service-name.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "environment": "production",
  "uptimeSeconds": 123,
  "serverTime": "2026-11-21T...",
  "database": {
    "mode": "mysql-prisma",
    "connected": true,
    "latencyMs": 45
  }
}
```

### 2. Check Deployment Status

```bash
curl https://your-service-name.onrender.com/api/deployment/status
```

**Expected Response:**
```json
{
  "status": "operational",
  "environment": "production",
  "version": "1.0.0",
  "features": {
    "persistenceMode": "mysql-prisma",
    "aiVision": false,
    ...
  }
}
```

### 3. Verify HTTPS Redirection

```bash
curl -I http://your-service-name.onrender.com/api/health
```

**Expected:** Should redirect to HTTPS with 301 status

### 4. Check Security Headers

```bash
curl -I https://your-service-name.onrender.com/
```

**Expected Headers:**
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection`
- `Content-Security-Policy`

### 5. Test Authentication

**Admin Login:**
```bash
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bugo.gov.ph","password":"<SEED_ADMIN_PASSWORD>"}'
```

**Expected:** JWT token returned

### 6. Test API Endpoints

```bash
# Get programs
curl https://your-service-name.onrender.com/api/programs

# Get applications (requires auth)
curl https://your-service-name.onrender.com/api/applications \
  -H "Authorization: Bearer <your-jwt-token>"

# Get database schema
curl https://your-service-name.onrender.com/api/database/schema
```

### 7. Test Frontend

Visit: `https://your-service-name.onrender.com`

**Verify:**
- ✅ Page loads without errors
- ✅ Login form appears
- ✅ Can login as admin/resident
- ✅ Dashboard loads
- ✅ Maps render (OpenStreetMap)
- ✅ No console errors

---

## 💾 Phase 6: Database Backup Setup

### Manual Backup

```bash
# SSH into Render or run locally with production DATABASE_URL
npm run db:backup
```

**Output:** Creates `backups/barangay_bugo_YYYYMMDD_HHMMSS.sql.gz`

### Automated Backup (Render Cron Job)

1. **Create Cron Job in Render**
   - Go to Dashboard → New → Cron Job
   - Name: `barangay-bugo-backup`
   - Command: `npm run db:backup`
   - Schedule: `0 2 * * *` (daily at 2 AM)

2. **Configure Environment**
   - Use same `DATABASE_URL` as web service
   - Add backup storage (S3, Cloudinary, etc.)

### Backup Verification

```bash
# List backups
ls -lh backups/

# Test restore (on test database)
gunzip -c backups/barangay_bugo_YYYYMMDD_HHMMSS.sql.gz | \
  mysql -h <host> -u <user> -p <test_database>
```

---

## 🔄 Phase 7: Post-Deployment Configuration

### 1. Update Credentials

**Important:** After successful deployment:

1. **Change Default Passwords**
   - Login as admin
   - Go to Settings → Change Password
   - Set new strong password

2. **Remove Seed Passwords from Environment**
   - Optional: Remove `SEED_ADMIN_PASSWORD` and `SEED_RESIDENT_PASSWORD` from Render environment
   - Or rotate them to new secure values

### 2. Configure Custom Domain (Optional)

1. **In Render Dashboard**
   - Go to Settings → Custom Domains
   - Add domain: `assist.barangaybugo.gov.ph`

2. **Update DNS Records**
   - Add CNAME: `assist → your-service-name.onrender.com`
   - Wait for DNS propagation (up to 24 hours)

3. **Update Environment Variables**
   ```env
   APP_URL=https://assist.barangaybugo.gov.ph
   CORS_ORIGIN=https://assist.barangaybugo.gov.ph
   ```

4. **Trigger Redeploy**
   - Render will automatically provision SSL certificate

### 3. Enable Monitoring

**Render Built-in Monitoring:**
- CPU usage
- Memory usage
- Request count
- Error rate
- Health check status

**External Monitoring (Optional):**
- UptimeRobot (free uptime monitoring)
- Better Uptime
- Pingdom
- New Relic

### 4. Set Up Alerts

1. **Email Notifications**
   - Render → Settings → Notifications
   - Add email for deployment failures

2. **Slack Integration** (optional)
   - Connect Slack workspace
   - Get notified on deployments/errors

---

## 📊 Performance Optimization

### 1. Database Connection Pooling

Prisma automatically handles connection pooling. Monitor connection count in logs.

### 2. CDN for Static Assets (Optional)

Consider Cloudflare CDN for:
- Faster asset delivery
- DDoS protection
- Additional caching

### 3. Render Auto-Scaling

Upgrade to higher plans for:
- More resources
- Auto-scaling
- Zero-downtime deploys

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** `npm ci` or build command fails

**Solutions:**
- Check Node.js version (should be 20+)
- Verify all dependencies in `package.json`
- Check build logs for specific errors

### Database Connection Fails

**Issue:** `DATABASE_URL` connection error

**Solutions:**
- Verify SSL parameter: `?sslaccept=strict`
- Check database credentials
- Ensure database allows connections from Render IPs
- Test connection locally first

### 503 Service Unavailable

**Issue:** Service starts but returns 503

**Solutions:**
- Check Render logs for errors
- Verify `PORT` is not hardcoded (Render injects it)
- Ensure health check path `/api/health` is accessible
- Check database migrations ran successfully

### HTTPS Redirect Loop

**Issue:** Infinite redirect between HTTP and HTTPS

**Solutions:**
- Verify `FORCE_HTTPS=true`
- Check `trust proxy` is set in server.ts
- Ensure Render's reverse proxy headers are trusted

### Frontend 404 Errors

**Issue:** React routes return 404

**Solutions:**
- Verify SPA fallback in server.ts
- Check dist/index.html exists
- Ensure build completed successfully

---

## 🔒 Security Checklist

- [ ] `NODE_ENV=production`
- [ ] `FORCE_HTTPS=true`
- [ ] Strong JWT_SECRET (64+ characters)
- [ ] Strong HMAC_SECRET (64+ characters)
- [ ] Strong admin password (not default)
- [ ] DATABASE_URL uses SSL (`?sslaccept=strict`)
- [ ] CORS configured correctly
- [ ] Helmet security headers active
- [ ] Rate limiting enabled
- [ ] No secrets in code/logs
- [ ] Database backups scheduled
- [ ] Monitoring enabled
- [ ] Error logs reviewed
- [ ] All test suites pass (npm test)

---

## 📚 Additional Resources

### Render Documentation
- [Deploy Node.js](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)
- [Database Backups](https://render.com/docs/databases)

### System Documentation
- `DEPLOYMENT.md` - Original deployment guide
- `DATABASE_SETUP_COMPLETE.md` - Database setup
- `FINAL_TEST_REPORT.md` - Complete test results
- `QUICK_START.md` - Quick start guide

---

## 🆘 Support

If you encounter issues:

1. **Check Render Logs**
   - Dashboard → Logs tab
   - Look for error messages

2. **Review Test Reports**
   - Run `npm test` locally
   - Check `FINAL_TEST_REPORT.md`

3. **Database Health**
   - Check `/api/health` endpoint
   - Verify database connection

4. **Contact Support**
   - Render support (for platform issues)
   - Developer team (for code issues)

---

## ✅ Deployment Complete!

Once all checks pass:

1. ✅ Service is live at `https://your-service-name.onrender.com`
2. ✅ HTTPS with valid SSL certificate
3. ✅ Database connected and operational
4. ✅ All API endpoints working
5. ✅ Frontend accessible
6. ✅ Admin and resident login functional
7. ✅ Security headers active
8. ✅ Backups scheduled

**Your Barangay Bugo system is now in production!** 🎉

---

**Last Updated:** 2026-11-21  
**System Version:** 1.0.0  
**Status:** Production Ready ✅
