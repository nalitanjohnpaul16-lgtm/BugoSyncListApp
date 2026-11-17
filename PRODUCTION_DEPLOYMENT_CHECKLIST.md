# Production Deployment Checklist - Barangay Bugo Resident Assistance Management System

## Pre-Deployment Preparation

### 1. Production Environment Variables Setup

Copy `.env.production` to your hosting platform's environment variables or secrets manager:

```bash
# Required Production Variables
NODE_ENV=production
PORT=3000
APP_URL=https://your-production-domain.com
CORS_ORIGIN=https://your-production-domain.com
FORCE_HTTPS=true

# Database (TLS-enabled MySQL 8.0+)
DATABASE_URL=mysql://username:password@host:3306/barangay_bugo_db?sslaccept=strict

# Security Secrets (64+ characters)
JWT_SECRET=<generated-64-char-hex>
HMAC_SECRET=<generated-64-char-hex>
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=2h

# Initial Admin Credentials
SEED_ADMIN_PASSWORD=<strong-password>
SEED_RESIDENT_PASSWORD=<strong-password>

# Optional: Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=<your-api-key>
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. MySQL Database Provisioning

#### Option A: Managed MySQL (Recommended)
- **Railway MySQL**: Automatic TLS, daily backups, Singapore region
- **DigitalOcean Managed MySQL**: `sgp1` region, automated backups
- **Aiven for MySQL**: Free tier, TLS enabled
- **AWS RDS MySQL**: Multi-AZ, automated backups

#### Option B: Self-Hosted MySQL 8.0+

```sql
CREATE DATABASE IF NOT EXISTS barangay_bugo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'bugo_prod_user'@'%' 
  IDENTIFIED BY 'STRONG_SECURE_PASSWORD';

GRANT ALL PRIVILEGES ON barangay_bugo_db.* 
  TO 'bugo_prod_user'@'%';

FLUSH PRIVILEGES;
```

Enable TLS/SSL connections in `my.cnf`:
```ini
[mysqld]
require_secure_transport=ON
ssl-ca=/path/to/ca-cert.pem
ssl-cert=/path/to/server-cert.pem
ssl-key=/path/to/server-key.pem
```

## Deployment Steps

### Step 1: Install Production Dependencies

```bash
npm ci --omit=dev
```

**Verify Node.js version:**
```bash
node --version  # Should be v20+ or v22+
npm --version   # Should be v10+
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

This creates the TypeScript client for MySQL operations based on `prisma/schema.prisma`.

### Step 3: Run Database Migrations

```bash
npx prisma migrate deploy
```

**Expected output:**
```
✔ The migration(s) have been applied successfully.
```

**Verify migration status:**
```bash
npx prisma migrate status
```

### Step 4: Seed Initial Data (First Deployment Only)

```bash
npm run prisma:seed
```

**This creates:**
- Admin user: `admin@bugo.gov.ph` (role: admin)
- Test resident: `resident@bugo.gov.ph` (role: resident)
- Default assistance programs
- Census data for puroks
- Initial announcements

**⚠️ CRITICAL: After first deployment, immediately:**
1. Login as admin
2. Change the admin password
3. Update or delete the test resident account
4. Remove `SEED_ADMIN_PASSWORD` and `SEED_RESIDENT_PASSWORD` from environment variables

### Step 5: Build Production Artifacts

```bash
npm run build
```

**This generates:**
- `dist/index.html` - Frontend entry point
- `dist/assets/*` - Optimized JS/CSS bundles
- `dist/server.mjs` - Production Express server

**Verify build artifacts:**
```bash
ls -lh dist/
# Should show: index.html, server.mjs, assets/
```

### Step 6: Start Production Server

```bash
npm start
```

**Or with PM2 process manager:**
```bash
pm2 start npm --name "bugo-sync-list" -- start
pm2 save
pm2 startup  # Enable auto-restart on server reboot
```

**Server health check:**
```bash
curl https://your-domain.com/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "database": {
    "mode": "mysql-prisma",
    "connected": true,
    "latency": "2.34ms"
  }
}
```

### Step 7: Verify Production Deployment

```bash
VERIFY_BASE_URL="https://your-production-domain.com" npm run verify:deploy
```

**This validates:**
- ✅ Frontend HTML entry point (HTTP 200)
- ✅ Static asset serving (favicon)
- ✅ Backend health & database connectivity
- ✅ Production build artifacts exist
- ✅ Admin login & JWT issuance
- ✅ Resident login & JWT issuance
- ✅ JWT session verification
- ✅ RBAC enforcement (401/403 responses)
- ✅ CRUD persistence & cleanup
- ✅ Security audit: zero exposed passwords

**Expected output:**
```
✔ PASS Frontend HTML Entry Point — HTTP 200 with React root HTML
✔ PASS Backend Health & DB Diagnostic — status=ok, mode=mysql-prisma, connected=true
...
Verification Summary: 11/11 checks passed
```

## Post-Deployment Operations

### Database Backups

#### Automated Daily Backup (Recommended)

```bash
# Create backup script wrapper
cat > /var/www/bugo-sync-list/backup.sh << 'EOF'
#!/bin/bash
source /var/www/bugo-sync-list/.env
bash /var/www/bugo-sync-list/scripts/backup_mysql.sh
EOF

chmod +x backup.sh

# Add to crontab (runs daily at 2:00 AM PHT)
crontab -e
# Add: 0 2 * * * /var/www/bugo-sync-list/backup.sh >> /var/www/bugo-sync-list/logs/backup.log 2>&1
```

#### Manual Backup

```bash
DATABASE_URL="mysql://user:pass@host:3306/barangay_bugo_db" bash scripts/backup_mysql.sh
```

**Backups stored in:** `backups/barangay_bugo_YYYYMMDD_HHMMSS.sql.gz`

**Retention:** 14 days (configurable in `scripts/backup_mysql.sh`)

### Database Restore

```bash
# Extract and restore
gunzip -c backups/barangay_bugo_20260115_020000.sql.gz | \
  mysql -h host -P 3306 -u username -p barangay_bugo_db
```

### SSL/TLS Certificate Setup (If Self-Hosting)

#### Using Nginx + Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal cron
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet
```

#### Nginx Configuration Example

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers (in addition to Helmet in Express)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Monitoring & Logging

#### Application Logs

- **Error logs:** `logs/error.log`
- **Server stdout:** Use PM2 logs or hosting platform logs

```bash
# PM2 logs
pm2 logs bugo-sync-list --lines 100

# Follow error log
tail -f logs/error.log
```

#### Health Check Monitoring

Setup external monitoring (UptimeRobot, Pingdom, etc.) for:
- **Endpoint:** `https://your-domain.com/api/health`
- **Interval:** 5 minutes
- **Expected:** HTTP 200 with `"status":"ok"`

#### Database Connection Monitoring

The `/api/health` endpoint checks:
- Database connectivity
- Query latency
- Connection pool status

## Security Hardening Checklist

- [x] **Strong secrets:** JWT_SECRET and HMAC_SECRET are 64+ characters
- [x] **HTTPS enforced:** FORCE_HTTPS=true with valid TLS certificate
- [x] **Database TLS:** DATABASE_URL includes `?sslaccept=strict`
- [x] **CORS restricted:** CORS_ORIGIN matches APP_URL exactly
- [x] **Default passwords rotated:** Admin and resident passwords changed after first login
- [x] **Environment secrets secured:** .env not in version control, secrets in platform manager
- [x] **Bcrypt rounds:** BCRYPT_ROUNDS=12 (production-grade)
- [x] **JWT expiration:** JWT_EXPIRES_IN=2h (reasonable session duration)
- [x] **Helmet security headers:** Automatically applied by server.ts
- [x] **Rate limiting:** Login brute-force protection active
- [x] **RBAC enforced:** Admin routes require admin JWT
- [x] **Input validation:** All user inputs sanitized
- [x] **SQL injection prevented:** Prisma ORM parameterized queries

## Rollback Procedure

### If deployment fails:

1. **Restore database from backup:**
   ```bash
   gunzip -c backups/barangay_bugo_LATEST.sql.gz | mysql -h host -u user -p barangay_bugo_db
   ```

2. **Revert to previous deployment:**
   ```bash
   git checkout <previous-commit>
   npm ci
   npm run build
   pm2 restart bugo-sync-list
   ```

3. **Verify health:**
   ```bash
   curl https://your-domain.com/api/health
   ```

## Troubleshooting

### Database Connection Issues

**Error:** `Can't connect to MySQL server`

**Solutions:**
- Verify DATABASE_URL is correct
- Check MySQL server is running and accessible
- Verify firewall allows connection from application server
- Test connection: `npx prisma db pull`

### Build Failures

**Error:** `Cannot find module 'vite'`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### JWT Verification Errors

**Error:** `jwt malformed` or `invalid signature`

**Solutions:**
- Ensure JWT_SECRET matches between deployments
- Clear browser localStorage and re-login
- Check token expiration (JWT_EXPIRES_IN)

### Migration Failures

**Error:** `Migration failed to apply`

**Solutions:**
```bash
# Check migration status
npx prisma migrate status

# Reset database (⚠️ DESTRUCTIVE - backup first!)
npx prisma migrate reset

# Or manually resolve:
npx prisma migrate resolve --applied <migration-name>
```

## Performance Optimization

### Database Indexing

Already optimized in schema with indexes on:
- `users.role`, `users.purok`
- `assistance_applications.status`, `assistance_applications.applicant_id`
- `assistance_programs.category`, `assistance_programs.status`
- `notifications.user_id`, `notifications.read`

### Connection Pooling

Prisma automatically manages connection pooling. Configure in DATABASE_URL:
```
mysql://user:pass@host:3306/db?connection_limit=10&pool_timeout=20
```

### CDN for Static Assets (Optional)

For high-traffic deployments, serve `dist/assets/*` via CDN:
1. Upload `dist/assets/*` to CDN (Cloudflare, CloudFront)
2. Update Vite build config to use CDN base URL

## Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor error logs
- Check health endpoint
- Review database backups

**Weekly:**
- Review security alerts
- Update dependencies (patch versions)
- Analyze application metrics

**Monthly:**
- Review and archive old records
- Database performance analysis
- Security audit

### Update Procedure

```bash
# 1. Backup database
DATABASE_URL="..." bash scripts/backup_mysql.sh

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm ci

# 4. Run migrations
npx prisma generate
npx prisma migrate deploy

# 5. Rebuild
npm run build

# 6. Restart
pm2 restart bugo-sync-list

# 7. Verify
VERIFY_BASE_URL="https://your-domain.com" npm run verify:deploy
```

## Emergency Contacts

- **System Administrator:** [Your contact]
- **Database Administrator:** [Your contact]
- **Barangay IT Coordinator:** [Your contact]
- **Hosting Provider Support:** [Provider support link]

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Production URL:** _______________  
**Database Host:** _______________  
**Backup Schedule:** Daily at 2:00 AM PHT  
**Monitoring Dashboard:** _______________
