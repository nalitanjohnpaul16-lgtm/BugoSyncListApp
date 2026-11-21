# ⚡ Quick Deployment Commands Reference

**Barangay Bugo - Production Deployment to Render**

---

## 🔧 Local Build Preparation

### Clean Install & Build
```bash
# Clean previous build
rm -rf dist node_modules

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build production bundle
npm run build

# Verify build artifacts
ls -la dist/
test -f dist/index.html && echo "✓ Frontend OK"
test -f dist/server.mjs && echo "✓ Backend OK"
```

### Quick Build Script
```bash
# Linux/Mac
chmod +x scripts/prepare-production.sh
./scripts/prepare-production.sh

# Windows
.\scripts\prepare-production.ps1
```

---

## 🔐 Generate Production Secrets

### JWT & HMAC Secrets (64 characters each)
```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# HMAC_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Strong Passwords
```bash
# Admin password
node -e "console.log(require('crypto').randomBytes(16).toString('base64') + '!@#')"

# Resident password
node -e "console.log(require('crypto').randomBytes(16).toString('base64') + '!@#')"
```

---

## 🗄️ Database Setup

### Local MySQL Setup
```sql
CREATE DATABASE IF NOT EXISTS barangay_bugo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'bugo_user'@'localhost' 
  IDENTIFIED BY 'YourStrongPassword';

GRANT ALL PRIVILEGES ON barangay_bugo_db.* 
  TO 'bugo_user'@'localhost';

FLUSH PRIVILEGES;
```

### Run Migrations
```bash
# Set DATABASE_URL
export DATABASE_URL="mysql://user:pass@host:3306/barangay_bugo_db?sslaccept=strict"

# Generate Prisma client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

# Verify
npx prisma migrate status
```

### Seed Initial Data (First Time Only)
```bash
npm run prisma:seed
```

---

## 🌐 Git & Repository Setup

### Initialize & Push
```bash
# Initialize (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Production deployment ready"

# Add remote (replace with your URL)
git remote add origin https://github.com/USERNAME/barangay-bugo.git

# Push
git push -u origin main
```

---

## 🚀 Render Deployment

### Environment Variables (Copy to Render Dashboard)

```env
NODE_ENV=production
FORCE_HTTPS=true
LOG_LEVEL=info
APP_URL=https://your-service-name.onrender.com
CORS_ORIGIN=https://your-service-name.onrender.com
DATABASE_URL=mysql://user:pass@host:3306/barangay_bugo_db?sslaccept=strict
JWT_SECRET=your-generated-64-char-secret
JWT_EXPIRES_IN=2h
BCRYPT_ROUNDS=12
HMAC_SECRET=your-generated-64-char-secret
SEED_ADMIN_PASSWORD=your-strong-admin-password
SEED_RESIDENT_PASSWORD=your-strong-resident-password
GEMINI_API_KEY=optional-gemini-api-key
```

### Render Shell Commands
```bash
# After initial deploy, run in Render Shell:

# Deploy migrations
npx prisma migrate deploy

# Seed database (first time only)
npm run prisma:seed

# Check Prisma status
npx prisma migrate status

# View logs
npm run logs
```

---

## ✅ Verification Commands

### Health Check
```bash
curl https://your-service-name.onrender.com/api/health

# Expected:
# {
#   "status": "ok",
#   "database": {
#     "mode": "mysql-prisma",
#     "connected": true,
#     "latencyMs": 45
#   }
# }
```

### Deployment Status
```bash
curl https://your-service-name.onrender.com/api/deployment/status
```

### HTTPS Redirect Test
```bash
curl -I http://your-service-name.onrender.com/api/health

# Should return: 301 Moved Permanently
# Location: https://...
```

### Security Headers Check
```bash
curl -I https://your-service-name.onrender.com/ | grep -i "security\|frame\|content"
```

### Test Admin Login
```bash
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bugo.gov.ph",
    "password": "your-seed-admin-password"
  }'

# Should return JWT token
```

### Test API Endpoints
```bash
# Programs
curl https://your-service-name.onrender.com/api/programs

# Applications (requires auth token)
curl https://your-service-name.onrender.com/api/applications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Database schema
curl https://your-service-name.onrender.com/api/database/schema

# Announcements
curl https://your-service-name.onrender.com/api/announcements
```

---

## 💾 Database Backup

### Manual Backup
```bash
# Run backup script
npm run db:backup

# List backups
ls -lh backups/

# Verify backup
gunzip -c backups/barangay_bugo_20261121_143022.sql.gz | head -n 20
```

### Restore from Backup
```bash
# Restore to database
gunzip -c backups/barangay_bugo_YYYYMMDD_HHMMSS.sql.gz | \
  mysql -h HOST -P 3306 -u USER -p barangay_bugo_db
```

### Automated Backup (Render Cron Job)
```bash
# In Render Dashboard:
# New → Cron Job
# Name: barangay-bugo-backup
# Command: npm run db:backup
# Schedule: 0 2 * * * (daily at 2 AM UTC)
```

---

## 🔍 Monitoring & Logs

### View Render Logs
```bash
# In Render Dashboard → Logs tab
# Or use Render CLI (if installed):
render logs --service=your-service-name --tail
```

### Check Database Connection
```bash
mysql -h HOST -u USER -p barangay_bugo_db -e "SELECT COUNT(*) FROM users;"
```

### Health Monitoring Script
```bash
#!/bin/bash
# Check health every 60 seconds
while true; do
  STATUS=$(curl -s https://your-service.onrender.com/api/health | jq -r '.status')
  if [ "$STATUS" = "ok" ]; then
    echo "$(date): ✓ Service healthy"
  else
    echo "$(date): ✗ Service degraded"
  fi
  sleep 60
done
```

---

## 🔄 Update & Redeploy

### After Code Changes
```bash
# 1. Commit changes
git add .
git commit -m "Your change description"
git push origin main

# 2. Render auto-deploys (if auto-deploy enabled)
# OR manually trigger deploy in Render Dashboard

# 3. Monitor build logs
# 4. Verify deployment
curl https://your-service-name.onrender.com/api/health
```

### Manual Redeploy (Without Code Changes)
```bash
# In Render Dashboard:
# Click "Manual Deploy" → "Deploy latest commit"
```

---

## 🧪 Testing Commands

### Run All Tests Locally
```bash
npm test

# Expected: 34/34 PASSED (100%)
```

### Run Linting
```bash
npm run lint

# Expected: No errors
```

### Run Deployment Verification
```bash
# Set your Render URL
export VERIFY_BASE_URL="https://your-service-name.onrender.com"

# Run verification
npm run verify:deploy

# Expected: 10/11 checks pass (production build not needed locally)
```

---

## 🛠️ Troubleshooting Commands

### Check Node.js Version
```bash
node --version  # Should be v20+ or v22+
npm --version   # Should be v10+
```

### Check Prisma Connection
```bash
# Set DATABASE_URL first
npx prisma db pull  # Pull schema from database
npx prisma studio   # Open Prisma Studio (GUI)
```

### Check Build Output
```bash
# Verify Vite output
cat dist/index.html | head -n 10

# Verify server.mjs
head -n 20 dist/server.mjs

# Check size
du -h dist/server.mjs
```

### Database Query Test
```bash
mysql -h HOST -u USER -p -e "
  USE barangay_bugo_db;
  SHOW TABLES;
  SELECT COUNT(*) as user_count FROM users;
  SELECT COUNT(*) as program_count FROM assistance_programs;
"
```

### Clear Render Cache
```bash
# In Render Dashboard → Settings → Clear Build Cache
# Then trigger a new deploy
```

---

## 📊 Useful SQL Queries

### Check Data Counts
```sql
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'assistance_programs', COUNT(*) FROM assistance_programs
UNION ALL SELECT 'assistance_applications', COUNT(*) FROM assistance_applications
UNION ALL SELECT 'announcements', COUNT(*) FROM announcements
UNION ALL SELECT 'census_puroks', COUNT(*) FROM census_puroks
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'activity_logs', COUNT(*) FROM activity_logs
UNION ALL SELECT 'archived_records', COUNT(*) FROM archived_records;
```

### Check Admin User
```sql
SELECT id, name, email, role, is_verified 
FROM users 
WHERE role = 'admin';
```

### Check Recent Applications
```sql
SELECT id, program_title, applicant_name, status, submission_date
FROM assistance_applications
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎯 One-Liner Commands

```bash
# Full build verification
npm ci && npx prisma generate && npm run build && test -f dist/index.html && test -f dist/server.mjs && echo "✅ Build OK"

# Generate all secrets at once
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")" && \
echo "HMAC_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")" && \
echo "ADMIN_PASS=$(node -e "console.log(require('crypto').randomBytes(16).toString('base64') + '!@#')")" && \
echo "RESIDENT_PASS=$(node -e "console.log(require('crypto').randomBytes(16).toString('base64') + '!@#')")"

# Quick health check
curl -s https://your-service.onrender.com/api/health | jq '.status,.database'

# Deploy migrations + seed
npx prisma migrate deploy && npm run prisma:seed

# Full verification
curl -s https://your-service.onrender.com/api/health && \
curl -s https://your-service.onrender.com/api/programs | jq 'length' && \
curl -s https://your-service.onrender.com/api/deployment/status | jq '.status'
```

---

## 📚 Quick Reference Links

- **Full Guide:** RENDER_DEPLOYMENT_GUIDE.md
- **Checklist:** DEPLOYMENT_CHECKLIST.md
- **Summary:** DEPLOYMENT_SUMMARY.md
- **Test Report:** FINAL_TEST_REPORT.md (100% pass)

---

**Last Updated:** 2026-11-21  
**Quick Reference Version:** 1.0
