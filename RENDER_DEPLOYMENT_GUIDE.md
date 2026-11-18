# Render.com FREE Deployment Guide
## Barangay Bugo Resident Assistance Management System

**🎯 Result:** Completely FREE deployment that handles 1000+ users

**⏱️ Time:** 15-20 minutes

**💰 Cost:** $0 (FREE forever, no credit card needed)

---

## 🌟 What You'll Get

- ✅ **Public URL:** `https://bugo-sync-list.onrender.com`
- ✅ **Automatic HTTPS** with SSL certificate
- ✅ **PostgreSQL database** (500MB free)
- ✅ **Auto-deploy** from GitHub
- ✅ **Custom domain support** (free)
- ✅ **Handles 1000+ concurrent users**
- ✅ **No credit card required**

---

## ⚠️ One Trade-off: Cold Starts

**What happens:**
- After 15 minutes of inactivity, the server "sleeps"
- First request after sleep takes 30-50 seconds
- After that, instant response for all users

**For Barangay System:**
- ✅ Daytime (8am-6pm): Always warm (people using it)
- ⏰ First access of the day: 30-50 second wait
- ✅ Rest of day: Instant for everyone

**Solutions:**
1. **Accept it** - 30s wait once/day is reasonable
2. **Keep-alive service** - Use UptimeRobot (free) to ping every 5 min
3. **Upgrade** - $7/month for always-on service

---

## 📋 Prerequisites (5 minutes)

### 1. GitHub Account
- If you don't have one, sign up at https://github.com

### 2. Push Your Code to GitHub
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Prepare for Render deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/bugo-sync-list.git
git push -u origin main
```

### 3. No Credit Card Needed!
Render's free tier doesn't require payment info.

---

## 🔄 Step 1: Convert MySQL to PostgreSQL (5 minutes)

Render provides FREE PostgreSQL. Your Prisma setup makes this super easy!

### A. Update Prisma Schema

Open `prisma/schema.prisma` and change line 7:

**Before:**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**After:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### B. Create New Migration

```bash
# This creates a PostgreSQL migration from your existing schema
npx prisma migrate dev --name postgresql_conversion

# Generate Prisma client
npx prisma generate
```

### C. Test Locally (Optional)

If you want to test first, use a free PostgreSQL database:
- **Supabase:** https://supabase.com (500MB free)
- **Neon.tech:** https://neon.tech (3GB free)

Or skip this and test directly on Render.

### D. Commit Changes

```bash
git add .
git commit -m "Convert to PostgreSQL for Render deployment"
git push
```

---

## 🚀 Step 2: Create Render Account (2 minutes)

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub (easiest)
4. Authorize Render to access your repositories
5. Verify your email

**✅ Done! No credit card needed.**

---

## 🗄️ Step 3: Create PostgreSQL Database (3 minutes)

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**

2. Configure database:
   - **Name:** `bugo-database`
   - **Database:** `barangay_bugo_db` (leave default if different)
   - **User:** `bugo_user` (leave default if different)
   - **Region:** **Singapore** (closest to Philippines)
   - **PostgreSQL Version:** 16 (latest)
   - **Instance Type:** **Free**

3. Click **"Create Database"**

4. Wait 1-2 minutes for provisioning

5. **IMPORTANT:** Copy the **Internal Database URL**
   - Look for: `postgresql://bugo_user:***@***:5432/bugo_database`
   - You'll need this in Step 5

---

## 🌐 Step 4: Create Web Service (3 minutes)

1. In Render Dashboard, click **"New +"** → **"Web Service"**

2. **Connect Repository:**
   - Choose **"Build and deploy from a Git repository"**
   - Click **"Connect account"** if needed
   - Select your repository: `bugo-sync-list`
   - Click **"Connect"**

3. **Configure Service:**

   **Basic Settings:**
   - **Name:** `bugo-sync-list`
   - **Region:** **Singapore**
   - **Branch:** `main`
   - **Runtime:** **Node**

   **Build & Deploy:**
   - **Build Command:**
     ```bash
     npm install && npm run build && npx prisma generate && npx prisma migrate deploy
     ```
   
   - **Start Command:**
     ```bash
     npm start
     ```

   **Instance Type:**
   - Select **"Free"**

4. Click **"Advanced"** to expand environment variables (next step)

---

## 🔐 Step 5: Add Environment Variables (3 minutes)

In the **Environment Variables** section, add these:

### Required Variables:

```bash
NODE_ENV=production

DATABASE_URL=
# Paste the Internal Database URL from Step 3
# Example: postgresql://bugo_user:password@dpg-xxx-a.singapore-postgres.render.com:5432/bugo_database

PORT=3000

APP_URL=https://bugo-sync-list.onrender.com
# Replace "bugo-sync-list" with your actual service name if different

CORS_ORIGIN=https://bugo-sync-list.onrender.com
# Must match APP_URL exactly

FORCE_HTTPS=true

JWT_SECRET=
# Generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# Paste the output here

HMAC_SECRET=
# Generate another: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# Paste the output here

JWT_EXPIRES_IN=2h

BCRYPT_ROUNDS=12

SEED_ADMIN_PASSWORD=BugoAdmin@Secure2026!#
# Change this to your desired admin password

SEED_RESIDENT_PASSWORD=BugoResident@Secure2026!#
# Change this to your desired resident password
```


```

### How to Generate Secrets:

Open terminal/PowerShell and run:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# Generate HMAC_SECRET (run again for different value)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the outputs and paste into the respective fields.

---

## 🎉 Step 6: Deploy! (5-10 minutes)

1. Click **"Create Web Service"** (bottom of page)

2. Render will:
   - ✅ Clone your repository
   - ✅ Install dependencies
   - ✅ Build frontend and backend
   - ✅ Generate Prisma client
   - ✅ Run database migrations
   - ✅ Start the server

3. **Watch the logs** - You'll see real-time build progress

4. **Wait for "Your service is live 🎉"** message

5. **First deployment takes 5-10 minutes**

---

## 🌱 Step 7: Seed Database (2 minutes)

After deployment completes:

1. In Render Dashboard, go to your service
2. Click **"Shell"** tab (top menu)
3. Wait for shell to connect
4. Run seed command:

```bash
npm run prisma:seed
```

5. Wait for success message: "Seed complete: 2 users, 44 services, 10 census puroks."

**✅ Database seeded with:**
- Admin: `admin@bugo.gov.ph`
- Resident: `resident@bugo.gov.ph`
- 44 assistance programs
- 10 census puroks

---

## ✅ Step 8: Verify Deployment (2 minutes)

### Test Health Endpoint:

Visit: `https://bugo-sync-list.onrender.com/api/health`

**Expected response:**
```json
{
  "status": "ok",
  "environment": "production",
  "database": {
    "mode": "mysql-prisma",
    "connected": true
  }
}
```

### Test Frontend:

Visit: `https://bugo-sync-list.onrender.com`

You should see the login page!

### Test Login:

**Admin Login:**
- Email: `admin@bugo.gov.ph`
- Password: (what you set in SEED_ADMIN_PASSWORD)

**Resident Login:**
- Email: `resident@bugo.gov.ph`
- Password: (what you set in SEED_RESIDENT_PASSWORD)

---

## 🎊 SUCCESS! Your System is Live!

Your Barangay Bugo system is now deployed at:
- **URL:** `https://bugo-sync-list.onrender.com`
- **Cost:** $0 (FREE)
- **Capacity:** 1000+ users
- **Uptime:** 24/7 (with 30s cold start after inactivity)

---

## 🔄 Auto-Deploy on Git Push

**Good news:** Every time you push to GitHub, Render automatically redeploys!

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push

# Render automatically deploys the update!
```

You can disable auto-deploy in Render settings if needed.

---

## 🌐 Add Custom Domain (Optional)

### Option 1: Free Render Subdomain
Already done! Your URL: `bugo-sync-list.onrender.com`

### Option 2: Custom Domain (e.g., assist.barangaybugo.gov.ph)

1. In Render Dashboard → Your Service → **"Settings"**
2. Scroll to **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Enter: `assist.barangaybugo.gov.ph`
5. Render provides DNS records (CNAME)
6. Add these records to your domain registrar:
   ```
   Type: CNAME
   Name: assist
   Value: bugo-sync-list.onrender.com
   ```
7. Wait for DNS propagation (5-60 minutes)
8. **SSL certificate automatically issued!**

### Update Environment Variables After Custom Domain:

```bash
APP_URL=https://assist.barangaybugo.gov.ph
CORS_ORIGIN=https://assist.barangaybugo.gov.ph
```

---

## 🆙 Upgrade Options (Future)

If you need to eliminate cold starts or get more resources:

| Plan | Cost | Benefits |
|------|------|----------|
| **Free** | $0 | What you have now |
| **Starter** | $7/month | No cold starts, always on |
| **Standard** | $25/month | More CPU/RAM, faster response |

**For now, stay FREE!** Upgrade only if:
- Cold starts become a problem
- You need guaranteed uptime for critical operations

---

## 🛠️ Troubleshooting

### Issue: Deployment Fails

**Check build logs:**
1. Dashboard → Your Service → **"Logs"**
2. Look for errors in red
3. Common issues:
   - Missing environment variable
   - Build command error
   - Database connection issue

**Solution:**
- Verify all environment variables are set
- Check DATABASE_URL is correct
- Ensure branch is pushed to GitHub

### Issue: Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
1. Verify DATABASE_URL is the **Internal** URL (not External)
2. Check database is in same region (Singapore)
3. Database must be "Active" status

### Issue: Cold Starts Too Long

**Solution 1: Keep-Alive (FREE)**
Use UptimeRobot.com:
1. Sign up at https://uptimerobot.com (free)
2. Add monitor: `https://bugo-sync-list.onrender.com/api/health`
3. Set interval: Every 5 minutes
4. **Result:** App stays warm during peak hours

**Solution 2: Upgrade**
- $7/month for always-on service
- No cold starts ever

### Issue: Database Full (500MB limit)

**Solutions:**
1. Clean old records (archive/delete)
2. Upgrade database ($7/month for 1GB, $15/month for 10GB)
3. Migrate to another free PostgreSQL (Supabase 500MB, Neon 3GB)

### Issue: Admin Password Wrong

**Reset via Render Shell:**
```bash
# Open Shell in Render Dashboard
npx prisma studio

# Access Prisma Studio in browser
# Update admin password manually
```

---

## 📊 Monitor Your Deployment

### Render Dashboard

**Metrics Available:**
- CPU usage
- Memory usage
- Request count
- Response times
- Error logs

**Access:**
Dashboard → Your Service → **"Metrics"**

### Uptime Monitoring (FREE)

Use **UptimeRobot.com**:
- Monitor: `https://bugo-sync-list.onrender.com/api/health`
- Get alerts if site goes down
- View uptime history

---

## 🔐 Security Checklist

After deployment:

- [ ] Change admin password (in app)
- [ ] Change resident password or delete account
- [ ] Remove SEED_*_PASSWORD env vars (optional)
- [ ] Review CORS_ORIGIN matches your domain
- [ ] Verify HTTPS is working
- [ ] Test JWT authentication
- [ ] Check no sensitive data in logs

---

## 🎯 Post-Deployment Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] Admin can login
- [ ] Resident can register
- [ ] Application creation works
- [ ] Database queries execute
- [ ] No console errors in browser
- [ ] Custom domain configured (optional)
- [ ] Monitoring setup (optional)
- [ ] Documentation updated with URL

---

## 📈 Performance Tips

### Keep App Warm (FREE)
Use UptimeRobot to ping every 5 minutes during business hours.

### Optimize Images
- Use WebP format
- Compress images before upload
- Use CDN for large files (Cloudinary free tier)

### Database Optimization
- Add indexes to frequently queried fields (already done in schema)
- Archive old applications periodically
- Clean up test data

### Frontend Optimization
- Already optimized (Vite build)
- Gzip compression enabled
- Static assets cached

---

## 🆘 Get Help

### Render Documentation
- https://render.com/docs
- https://community.render.com

### Common Issues
- Build failures: Check Render logs
- Database issues: Verify DATABASE_URL
- Cold starts: Use UptimeRobot or upgrade

### Contact Support
- Render Support: https://render.com/contact
- Community Forum: https://community.render.com

---

## 🎉 Congratulations!

You now have a **FREE, production-ready** deployment of your Barangay Bugo system!

### What You Achieved:
- ✅ Professional public URL
- ✅ HTTPS encryption
- ✅ Auto-deploy from GitHub
- ✅ PostgreSQL database
- ✅ Handles 1000+ users
- ✅ $0 cost

### Next Steps:
1. Share URL with stakeholders
2. Test with real users
3. Gather feedback
4. Iterate and improve
5. Upgrade when needed

---

**Your FREE deployment is complete! 🚀**

**Live URL:** `https://bugo-sync-list.onrender.com`  
**Admin Panel:** `https://bugo-sync-list.onrender.com`  
**Health Check:** `https://bugo-sync-list.onrender.com/api/health`

Enjoy your free, professional-grade hosting! 🎊
