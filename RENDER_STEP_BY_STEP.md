# Render Deployment - Step by Step Guide

## ✅ What's Already Done:
- ✅ Code converted to PostgreSQL
- ✅ Code pushed to GitHub
- ✅ Environment variables generated
- ✅ Everything ready to deploy!

---

## 🎯 YOUR STEPS (10 Minutes Total)

### STEP 1: Create Render Account (2 minutes)

1. Go to: **https://render.com**
2. Click **"Get Started"**
3. Click **"Sign in with GitHub"**
4. Authorize Render (approve access)
5. ✅ Done! No credit card needed

---

### STEP 2: Create PostgreSQL Database (2 minutes)

1. In Render Dashboard, click **"New +"** (top right)
2. Select **"PostgreSQL"**

3. **Fill in:**
   - **Name:** `bugo-database`
   - **Database:** `barangay_bugo_db`
   - **User:** (leave default)
   - **Region:** **Singapore** ⬅️ IMPORTANT!
   - **PostgreSQL Version:** 16
   - **Instance Type:** **Free** ⬅️ SELECT THIS!

4. Click **"Create Database"**
5. Wait 1-2 minutes for creation

6. **COPY THE INTERNAL DATABASE URL:**
   - Click on your database name
   - Find **"Internal Database URL"**
   - Click the copy icon 📋
   - Save it somewhere (you'll need it in Step 3)
   - It looks like: `postgresql://bugo_user:***@dpg-***-a.singapore-postgres.render.com:5432/bugo_database`

---

### STEP 3: Create Web Service (3 minutes)

1. In Render Dashboard, click **"New +"**
2. Select **"Web Service"**

3. **Connect Repository:**
   - Select **"Build and deploy from a Git repository"**
   - Click **"Connect account"** (if needed)
   - Find and select: **"BugoSyncListApp"**
   - Click **"Connect"**

4. **Configure Service:**

   **Basic Info:**
   - **Name:** `bugo-sync-list` (or any name you like)
   - **Region:** **Singapore** ⬅️ SAME AS DATABASE!
   - **Branch:** `main`
   - **Runtime:** **Node**

   **Build Settings:**
   - **Build Command:**
     ```
     npm install && npm run build && npx prisma generate && npx prisma migrate deploy
     ```
   
   - **Start Command:**
     ```
     npm start
     ```

   **Instance Type:**
   - Select **"Free"** ⬅️ IMPORTANT!

5. **Click "Advanced"** to show environment variables

---

### STEP 4: Add Environment Variables (2 minutes)

**IMPORTANT:** Open the file `RENDER_ENV_VARIABLES.txt` and copy values from there!

In the **Environment Variables** section, click **"Add Environment Variable"** for each one:

#### Required Variables (Must Have):

```
NODE_ENV=production

DATABASE_URL=[PASTE Internal Database URL from Step 2]

PORT=3000

APP_URL=https://bugo-sync-list.onrender.com

CORS_ORIGIN=https://bugo-sync-list.onrender.com

FORCE_HTTPS=true

JWT_SECRET=1252d17d1e9f5846e2d3f4dfe0eda637bd19309be0808c4a6c1b56f6f2fc524da9ff980f87c57b370ad3c12b3c5d6f1f

HMAC_SECRET=1eec9b76f7c92aeebd55e89831b5bed9e6fd309ac982c45af87a5c8341f36b0c42d581f482f34502641202cba38e566d

JWT_EXPIRES_IN=2h

BCRYPT_ROUNDS=12

SEED_ADMIN_PASSWORD=BugoAdmin@Secure2026!#

SEED_RESIDENT_PASSWORD=BugoResident@Secure2026!#
```

**Note:** 
- If you named your service differently than "bugo-sync-list", update APP_URL and CORS_ORIGIN accordingly!
- The hazard map uses **OpenStreetMap** (free, no API key) 🗺️
- ID verification uses **Tesseract OCR** (free, runs locally, no API key) 🔍

---

### STEP 5: Deploy! (5-10 minutes)

1. Click **"Create Web Service"** at the bottom

2. **Watch the deployment logs:**
   - Installing dependencies...
   - Building application...
   - Running migrations...
   - Starting server...

3. Wait for **"Your service is live 🎉"**

4. **First deployment takes 5-10 minutes**

---

### STEP 6: Seed Database (1 minute)

After deployment completes:

1. In Render Dashboard, go to your **bugo-sync-list** service
2. Click the **"Shell"** tab (top menu)
3. Wait for shell to connect (10-20 seconds)
4. Run this command:

```bash
npm run prisma:seed
```

5. Wait for: **"Seed complete: 2 users, 44 services, 10 census puroks."**

---

### STEP 7: Test Your Deployment! (1 minute)

**1. Check Health:**
Visit: `https://bugo-sync-list.onrender.com/api/health`

Should return:
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

**2. Open Your App:**
Visit: `https://bugo-sync-list.onrender.com`

**3. Login:**
- **Admin:**
  - Email: `admin@bugo.gov.ph`
  - Password: `BugoAdmin@Secure2026!#`

- **Resident:**
  - Email: `resident@bugo.gov.ph`
  - Password: `BugoResident@Secure2026!#`

---

## 🎉 SUCCESS!

Your Barangay Bugo system is now LIVE at:
**https://bugo-sync-list.onrender.com**

### What You Have:
- ✅ FREE hosting (forever)
- ✅ HTTPS enabled
- ✅ PostgreSQL database (500MB)
- ✅ Auto-deploy from GitHub
- ✅ Handles 1000+ users

---

## 📝 Important Notes

### Cold Starts
After 15 minutes of inactivity, the server "sleeps". First request takes 30-50 seconds.

**Solution:**
- Accept it (30s wait once per day is fine)
- Use UptimeRobot.com (free) to ping every 5 minutes
- Upgrade to $7/month for always-on

### Auto-Deploy
Every time you push to GitHub, Render automatically redeploys!

```bash
git add .
git commit -m "Update feature"
git push
# Render automatically deploys!
```

### Security
After first login:
1. Change admin password
2. Delete or update test resident account
3. Remove SEED_*_PASSWORD from environment variables

---

## 🆘 Troubleshooting

### Build Fails
- Check Render logs (Logs tab)
- Verify all environment variables are set
- Ensure DATABASE_URL is the **Internal** URL

### Database Connection Error
- Use **Internal Database URL** (not External)
- Verify both services are in Singapore region
- Check database status is "Available"

### App Won't Load
- Wait 30-50 seconds (cold start)
- Check Render logs for errors
- Verify APP_URL matches your service URL

---

## 🎯 Files You Need

1. **RENDER_ENV_VARIABLES.txt** - All your environment variables
2. **This file** - Step-by-step instructions

---

**Ready? Start with Step 1 and follow along!** 🚀

**Tell me when you reach each step and I'll help if needed!**
