# Quick Production Deployment Guide

## Prerequisites
- Node.js 20+ or 22+
- MySQL 8.0+
- Production hosting platform account

## 5-Minute Deployment

### 1. Environment Setup (2 minutes)
```bash
# Generate secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(48).toString('hex'))"
node -e "console.log('HMAC_SECRET=' + require('crypto').randomBytes(48).toString('hex'))"

# Copy .env.production and update:
# - DATABASE_URL (your MySQL connection string with ?sslaccept=strict)
# - APP_URL (your production domain)
# - CORS_ORIGIN (same as APP_URL)
# - JWT_SECRET (generated above)
# - HMAC_SECRET (generated above)
# - SEED_ADMIN_PASSWORD (strong password)
# - SEED_RESIDENT_PASSWORD (strong password)
```

### 2. Database Setup (1 minute)
```bash
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

### 3. Build & Deploy (2 minutes)
```bash
npm ci --omit=dev
npm run build
npm start
```

### 4. Verify
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok","database":{"mode":"mysql-prisma","connected":true}}
```

## Production Verification
```bash
# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim('"')
        [System.Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

$env:VERIFY_BASE_URL = "http://localhost:3000"
npm run verify:deploy
```

## Production URLs to Test
- `GET /api/health` - Health check
- `GET /` - Frontend application
- `POST /api/auth/login` - Authentication
- `GET /api/programs` - Assistance programs
- `GET /api/announcements` - Public announcements

## Default Accounts
- **Admin:** `admin@bugo.gov.ph` / (SEED_ADMIN_PASSWORD)
- **Resident:** `resident@bugo.gov.ph` / (SEED_RESIDENT_PASSWORD)

⚠️ **Change passwords immediately after first login!**

## Process Management (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "bugo-sync-list" -- start

# Save process list
pm2 save

# Enable startup script
pm2 startup

# View logs
pm2 logs bugo-sync-list

# Restart
pm2 restart bugo-sync-list

# Stop
pm2 stop bugo-sync-list
```

## Hosting Platform Examples

### Railway
1. Connect GitHub repository
2. Add MySQL database service
3. Set environment variables in dashboard
4. Deploy automatically on push

### DigitalOcean App Platform
1. Create new app from GitHub
2. Provision managed MySQL database
3. Set environment variables
4. Deploy

### VPS (Ubuntu)
```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server

# Clone repository
git clone <your-repo> /var/www/bugo-sync-list
cd /var/www/bugo-sync-list

# Configure .env
nano .env

# Install and build
npm ci --omit=dev
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "bugo-sync-list" -- start
pm2 save
pm2 startup

# Setup Nginx reverse proxy
sudo apt install nginx
# Configure Nginx (see PRODUCTION_DEPLOYMENT_CHECKLIST.md)

# Setup SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Troubleshooting

**Server won't start:**
```bash
# Check Node version
node --version  # Should be v20+ or v22+

# Check for syntax errors
npm run lint

# Check ports
netstat -ano | findstr :3000
```

**Database connection fails:**
```bash
# Test connection
npx prisma db pull

# Check MySQL status
# Windows: Check Services
# Linux: systemctl status mysql
```

**Build errors:**
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Quick Health Check Script
```powershell
# health-check.ps1
$response = Invoke-RestMethod "http://localhost:3000/api/health"
if ($response.status -eq "ok") {
    Write-Host "✓ Server is healthy" -ForegroundColor Green
    Write-Host "  Database: $($response.database.mode)" -ForegroundColor Cyan
    Write-Host "  Connected: $($response.database.connected)" -ForegroundColor Cyan
} else {
    Write-Host "✗ Server is unhealthy" -ForegroundColor Red
}
```

## Support
- Full Guide: See `DEPLOYMENT.md`
- Detailed Checklist: See `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- Summary: See `DEPLOYMENT_SUMMARY.md`
