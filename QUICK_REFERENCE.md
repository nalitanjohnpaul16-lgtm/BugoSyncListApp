# MySQL + Prisma Quick Reference

## 🔐 Login Credentials

### Admin Account
- **Email**: `admin@bugo.gov.ph`
- **Password**: `BugoAdmin@Secure2026!#`
- **Role**: admin

### Resident Account
- **Email**: `resident@bugo.gov.ph`
- **Password**: `BugoResident@Secure2026!#`
- **Role**: resident

---

## 🚀 Quick Start Commands

```powershell
# Start development server
npm run dev

# Generate Prisma client (after schema changes)
npm run prisma:generate

# Deploy migrations
npm run prisma:migrate:deploy

# Seed database
npm run prisma:seed
```

---

## 💾 Backup & Restore

### Create Backup
```powershell
# Set DATABASE_URL and run backup
Get-Content .env | ForEach-Object {
    if ($_ -match '^DATABASE_URL="(.+)"$') { $env:DATABASE_URL = $matches[1] }
}
.\scripts\backup_mysql.ps1
```

### Restore Backup
```powershell
# Restore from backup file
.\scripts\restore_mysql.ps1 -BackupFile "backups\barangay_bugo_YYYYMMDD_HHMMSS.sql.zip"
```

---

## 🔍 Health Check

```powershell
# Check API health endpoint
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

Expected response:
```json
{
  "status": "ok",
  "database": {
    "mode": "mysql-prisma",
    "connected": true
  }
}
```

---

## 🗄️ Database Access

```powershell
# Connect to MySQL
mysql -u root -p -D barangay_bugo_db

# Show tables
SHOW TABLES;

# Check row counts
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'barangay_bugo_db';
```

---

## 📋 Current Database Status

| Item | Value |
|------|-------|
| MySQL Version | 8.0.44 |
| Database Name | barangay_bugo_db |
| Total Tables | 9 (8 core + migrations) |
| Users | 2 |
| Programs | 44 |
| Census Puroks | 10 |
| Health Status | ✅ Connected |

---

## ⚠️ Important Files

- **Schema**: `prisma/schema.prisma`
- **Environment**: `.env` (never commit!)
- **Seed Script**: `prisma/seed.ts`
- **Backup Script**: `scripts/backup_mysql.ps1`
- **Restore Script**: `scripts/restore_mysql.ps1`
- **Backups Directory**: `backups/`

---

## 🛠️ Troubleshooting

### Server won't start
```powershell
# Check if MySQL is running
mysql -u root -p -e "SELECT 1;"

# Regenerate Prisma client
npm run prisma:generate
```

### Database connection error
```powershell
# Verify DATABASE_URL in .env
Get-Content .env | Select-String "DATABASE_URL"

# Test connection
mysql -u root -p -D barangay_bugo_db -e "SELECT 1;"
```

### Reset database
```powershell
# Drop and recreate
mysql -u root -p -e "DROP DATABASE IF EXISTS barangay_bugo_db;"
mysql -u root -p -e "CREATE DATABASE barangay_bugo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations and seed
npm run prisma:migrate:deploy
npm run prisma:seed
```

---

**Last Updated**: November 18, 2026  
**Setup Status**: ✅ Complete and Verified
