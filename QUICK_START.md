# 🚀 Quick Start Guide - Barangay Bugo System

## Database Setup Complete ✅

Your MySQL database is now fully configured and running!

---

## 🌐 Access the Application

**Server URL:** http://localhost:3000

The development server is currently running with MySQL persistence mode.

---

## 🔐 Login Credentials

### Administrator Account
```
Email:    admin@bugo.gov.ph
Password: Admin@Bugo2026
Role:     admin
```

**Admin capabilities:**
- Manage all assistance programs
- Review and approve applications
- Manage user accounts
- View activity logs and analytics
- Create announcements
- Access census data

### Resident Account
```
Email:    resident@bugo.gov.ph
Password: Resident@Bugo2026
Role:     resident
```

**Resident capabilities:**
- Browse assistance programs
- Submit applications for services
- Track application status
- View notifications
- Update profile information

---

## 📊 Database Information

```
Database: barangay_bugo_db
Host:     127.0.0.1:3306
User:     bugo_user
Tables:   8 (InnoDB with utf8mb4)
```

### Current Data
- **3 users** (1 admin, 2 residents)
- **57 assistance programs** (health, administrative, emergency services)
- **3 sample applications**
- **10 census zones** (Zone 1-10 demographic data)
- **8 notifications**
- **1 announcement**

---

## 🔌 API Endpoints

Test the API using these endpoints:

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Database Schema
```bash
curl http://localhost:3000/api/database/schema
```

### Programs Catalog
```bash
curl http://localhost:3000/api/programs
```

### Applications
```bash
curl http://localhost:3000/api/applications
```

### Census Data
```bash
curl http://localhost:3000/api/census
```

---

## 🛠️ Common Commands

### Start Development Server
```bash
npm run dev
```

### Generate Prisma Client (after schema changes)
```bash
npm run prisma:generate
```

### Run Database Migrations
```bash
npm run prisma:migrate:deploy
```

### Reseed Database
```bash
npm run prisma:seed
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

---

## 📁 Important Files

- `.env` - Environment variables (DATABASE_URL, JWT secrets, passwords)
- `prisma/schema.prisma` - Database schema definition
- `database/schema_mysql.sql` - SQL DDL reference
- `DATABASE_SETUP_COMPLETE.md` - Detailed setup documentation
- `.database-credentials.txt` - Quick credential reference

---

## 🔄 Server Management

### Check if server is running
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

### Stop the server
Press `Ctrl + C` in the terminal running `npm run dev`

### Restart the server
```bash
npm run dev
```

---

## 📚 Features Overview

### Barangay Services (57 Programs)
1. **Administrative Services** (10)
   - Barangay Clearance
   - Certificate of Residency
   - Certificate of Indigency
   - Good Moral Character
   - First-Time Job Seeker
   - Business Permit Endorsement
   - And more...

2. **Health Services** (15)
   - Free Medical Consultations
   - Immunization & Vaccination
   - Maternal & Prenatal Care
   - Family Planning
   - TB-DOTS Treatment
   - Dental Services
   - And more...

3. **Social Welfare** (8)
   - Financial Assistance
   - Educational Support
   - Livelihood Programs
   - Solo Parent Support
   - Senior Citizen Services
   - PWD Services
   - And more...

4. **Emergency Services** (6)
   - Disaster Relief
   - Fire Response
   - Medical Emergency
   - Rescue Operations
   - And more...

5. **Civil Registration** (8)
   - Birth Certificate Assistance
   - Marriage Certificate
   - Death Certificate
   - And more...

---

## 🧪 Testing the System

### 1. Login as Admin
1. Navigate to http://localhost:3000
2. Login with admin@bugo.gov.ph / Admin@Bugo2026
3. Access the admin dashboard

### 2. Browse Programs
- View all 57 assistance programs
- Filter by category
- Check program requirements

### 3. Submit Application (as resident)
1. Logout and login as resident@bugo.gov.ph
2. Browse available programs
3. Submit an application
4. Upload required documents
5. Track application status

### 4. Process Application (as admin)
1. Login as admin
2. Review pending applications
3. Approve/reject applications
4. Add evaluator notes

---

## ⚠️ Security Reminders

- ⚠️ Change default passwords before production deployment
- ⚠️ Never commit `.env` file to Git
- ⚠️ Rotate JWT and HMAC secrets for production
- ⚠️ Use SSL/TLS for production MySQL connection
- ⚠️ Keep `.database-credentials.txt` secure

---

## 🆘 Troubleshooting

### Can't connect to database?
```bash
# Check MySQL service is running
mysql -u bugo_user -pBugoStrong2026Pass -D barangay_bugo_db -e "SELECT 1;"
```

### Server won't start?
```bash
# Check if port 3000 is already in use
netstat -ano | findstr :3000

# Kill the process using port 3000 if needed
```

### Prisma errors?
```bash
# Regenerate Prisma client
npm run prisma:generate

# Check database connection
npx prisma db pull
```

---

## 📞 Support

For questions or issues with the database setup, refer to:
- `DATABASE_SETUP_COMPLETE.md` - Complete setup documentation
- `DEPLOYMENT.md` - Production deployment guide
- `README.md` - Project overview and architecture

---

**🎉 Your database is ready! Start building amazing features for Barangay Bugo!**
