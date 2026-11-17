# Production Deployment Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT PREPARATION                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Choose Hosting Platform                                     │
│     ┌─────────────┬──────────────┬─────────────────┐          │
│     │ Railway     │ DigitalOcean │ VPS (Ubuntu)    │          │
│     │ (Easiest)   │ App Platform │ (Most Control)  │          │
│     └─────────────┴──────────────┴─────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Provision MySQL 8.0+ Database                               │
│     • Create database: barangay_bugo_db                        │
│     • Create user with full privileges                         │
│     • Enable TLS/SSL connections                               │
│     • Note connection string                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Generate Cryptographic Secrets                              │
│     Run: node -e "console.log(require('crypto')                │
│              .randomBytes(48).toString('hex'))"                 │
│     • JWT_SECRET (64+ chars)                                   │
│     • HMAC_SECRET (64+ chars)                                  │
│     • SEED_ADMIN_PASSWORD (strong password)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Configure Environment Variables                             │
│     Copy .env.production template and set:                     │
│     • NODE_ENV=production                                      │
│     • DATABASE_URL (with ?sslaccept=strict)                    │
│     • APP_URL (https://your-domain.com)                        │
│     • CORS_ORIGIN (same as APP_URL)                            │
│     • FORCE_HTTPS=true                                         │
│     • JWT_SECRET, HMAC_SECRET (generated above)                │
│     • SEED_ADMIN_PASSWORD, SEED_RESIDENT_PASSWORD             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUILD & MIGRATION                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. Install Dependencies                                        │
│     npm ci --omit=dev                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. Generate Prisma Client                                      │
│     npx prisma generate                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. Apply Database Migrations                                   │
│     npx prisma migrate deploy                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. Seed Initial Data (First Deployment Only)                   │
│     npm run prisma:seed                                         │
│     Creates: Admin, Resident, Programs, Census                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  9. Build Production Artifacts                                  │
│     npm run build                                               │
│     Generates:                                                  │
│     • dist/index.html (Frontend)                               │
│     • dist/assets/* (CSS/JS bundles)                           │
│     • dist/server.mjs (Backend)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    START & VERIFY                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  10. Start Production Server                                    │
│      npm start                                                  │
│      or                                                         │
│      pm2 start npm --name "bugo-sync-list" -- start           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  11. Verify Deployment                                          │
│      VERIFY_BASE_URL="https://your-url" npm run verify:deploy  │
│                                                                 │
│      Tests:                                                     │
│      ✓ Frontend HTML serving                                   │
│      ✓ Backend health endpoint                                 │
│      ✓ Database connectivity                                   │
│      ✓ Admin/Resident login                                    │
│      ✓ JWT authentication                                      │
│      ✓ RBAC enforcement                                        │
│      ✓ CRUD operations                                         │
│      ✓ Security headers                                        │
│      ✓ Password security                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                   PASS               FAIL
                    │                   │
                    ▼                   ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │  DEPLOYMENT SUCCESS  │  │   TROUBLESHOOTING    │
    └──────────────────────┘  │  • Check logs        │
                              │  • Verify configs    │
                              │  • Review errors     │
                              │  • Retry steps       │
                              └──────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POST-DEPLOYMENT                              │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  12. Immediate Actions (First 24 Hours)                         │
│      • Login as admin@bugo.gov.ph                              │
│      • Change admin password                                    │
│      • Update or delete test resident account                  │
│      • Remove SEED_*_PASSWORD from environment                 │
│      • Test all critical user flows                            │
│      • Verify no errors in browser console                     │
│      • Check logs/error.log for issues                         │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  13. Configure Automated Backups                                │
│      • Set up daily cron job at 2:00 AM PHT                    │
│      • Test backup script: bash scripts/backup_mysql.sh        │
│      • Verify backup location: backups/                        │
│      • Test restore procedure once                             │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  14. Set Up Monitoring                                          │
│      • Configure uptime monitoring (UptimeRobot/Pingdom)       │
│      • Monitor /api/health endpoint (5-min intervals)          │
│      • Set up log aggregation                                  │
│      • Configure alert notifications                            │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  15. Security Hardening                                         │
│      • Review CORS settings                                    │
│      • Verify HTTPS enforcement                                │
│      • Test rate limiting (5 failed logins)                    │
│      • Review database user permissions                        │
│      • Ensure no password leaks in API responses               │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              ✓ PRODUCTION DEPLOYMENT COMPLETE                   │
│                                                                 │
│  System Status: LIVE                                           │
│  Database: Connected                                           │
│  Security: Hardened                                            │
│  Backups: Automated                                            │
│  Monitoring: Active                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Decision Tree

```
START: Do you have a domain name?
│
├─ YES → Proceed with production URL (https://your-domain.com)
│        Configure DNS A/CNAME records
│        Set up SSL certificate (Certbot or platform-managed)
│
└─ NO  → Use platform-provided URL (e.g., https://app.railway.app)
         Can add custom domain later without code changes
         Just update APP_URL and CORS_ORIGIN environment variables


HOSTING: Which platform suits you best?
│
├─ EASIEST (Recommended for Quick Deploy)
│  └─ Railway
│     • One-click MySQL provisioning
│     • Automatic HTTPS
│     • GitHub integration
│     • Built-in environment variables
│     Duration: ~15 minutes
│
├─ BALANCED (Good for Production)
│  └─ DigitalOcean App Platform + Managed MySQL
│     • Singapore region (low latency)
│     • Managed backups
│     • Scalable resources
│     Duration: ~30 minutes
│
└─ FULL CONTROL (For Advanced Users)
   └─ VPS (Ubuntu 22.04/24.04)
      • Complete control over stack
      • Manual Nginx + PM2 setup
      • Certbot SSL certificates
      Duration: ~2 hours


DATABASE: Do you have MySQL 8.0+ already?
│
├─ YES → Note connection string
│        Ensure TLS is enabled
│        Create barangay_bugo_db database
│        Add ?sslaccept=strict to URL
│
└─ NO  → Choose managed MySQL:
         • Railway MySQL (automatic)
         • DigitalOcean Managed Database
         • Aiven for MySQL (free tier)
         • AWS RDS MySQL


SECRETS: Need to generate new secrets?
│
├─ YES → Run: node -e "console.log(require('crypto')
│                .randomBytes(48).toString('hex'))"
│        Repeat twice (JWT_SECRET, HMAC_SECRET)
│
└─ NO  → Use pre-generated secrets from .env.production
         (Already strong and production-ready)
```

## Rollback Procedure

```
ISSUE DETECTED
│
▼
┌─────────────────────────────────────────┐
│ 1. Stop Production Server               │
│    pm2 stop bugo-sync-list              │
└─────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ 2. Restore Database from Backup         │
│    gunzip -c backups/latest.sql.gz |    │
│    mysql -h host -u user -p db_name     │
└─────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ 3. Revert Code to Previous Version      │
│    git checkout <previous-commit>       │
└─────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ 4. Rebuild                               │
│    npm ci                                │
│    npm run build                         │
└─────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ 5. Restart Server                        │
│    pm2 restart bugo-sync-list           │
└─────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ 6. Verify Health                         │
│    curl /api/health                      │
└─────────────────────────────────────────┘
│
▼
SYSTEM RESTORED
```

## Maintenance Schedule

```
DAILY
│
├─ Automated Backup (2:00 AM PHT)
├─ Review Error Logs
└─ Monitor Uptime Dashboard

WEEKLY
│
├─ Review Application Metrics
├─ Check Database Performance
└─ Security Audit (Failed Login Attempts)

MONTHLY
│
├─ Test Backup Restoration
├─ Review and Archive Old Records
├─ Update Dependencies (Patch Versions)
└─ Performance Analysis

QUARTERLY
│
├─ Update Dependencies (Minor Versions)
├─ Security Penetration Test
├─ Capacity Planning Review
└─ Database Optimization (Index Review)

ANNUALLY
│
├─ Full Security Audit
├─ Disaster Recovery Test
├─ Update Dependencies (Major Versions)
└─ Infrastructure Review
```

## Quick Health Check Decision Tree

```
Run: curl https://your-url/api/health
│
├─ HTTP 200 + {"status":"ok"}
│  └─ ✓ System Healthy
│
├─ HTTP 200 + {"status":"error"}
│  └─ Check "database.connected" field
│     ├─ false → Database connection issue
│     │         • Verify DATABASE_URL
│     │         • Check MySQL server status
│     │         • Review firewall rules
│     └─ true → Application error
│               • Check logs/error.log
│               • Review recent deployments
│
├─ HTTP 500
│  └─ Server Error
│     • Check logs/error.log
│     • Verify environment variables
│     • Restart server: pm2 restart bugo-sync-list
│
├─ HTTP 503
│  └─ Service Unavailable
│     • Server may be starting up (wait 30s)
│     • Or crashed → pm2 logs bugo-sync-list
│
└─ Connection Refused
   └─ Server Not Running
      • Start server: npm start
      • Or pm2 start npm --name "bugo-sync-list" -- start
```

---

**Use this flowchart alongside:**
- DEPLOYMENT.md (detailed steps)
- PRODUCTION_DEPLOYMENT_CHECKLIST.md (structured guide)
- QUICK_DEPLOY.md (fast reference)
