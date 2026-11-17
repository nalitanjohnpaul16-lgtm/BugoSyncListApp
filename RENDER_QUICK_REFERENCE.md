# Render.com Deployment - Quick Reference Card

## ✅ What's Been Done
- ✅ MySQL → PostgreSQL conversion
- ✅ Prisma client generated  
- ✅ Production build created
- ✅ Configuration files ready

## 🚀 Your 5 Steps (10 Minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Sign Up to Render
- Go to: https://render.com
- Click "Get Started"
- Sign up with GitHub
- No credit card needed!

### 3. Create Database (2 min)
- Dashboard → "New +" → "PostgreSQL"
- Name: `bugo-database`
- Region: **Singapore**
- Type: **Free**
- Copy Internal Database URL 📋

### 4. Create Web Service (3 min)
- Dashboard → "New +" → "Web Service"
- Connect repo: `bugo-sync-list`
- Region: **Singapore**
- Type: **Free**

**Build Command:**
```bash
npm install && npm run build && npx prisma generate && npx prisma migrate deploy
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
```bash
NODE_ENV=production
DATABASE_URL=[paste Internal URL from step 3]
PORT=3000
APP_URL=https://bugo-sync-list.onrender.com
CORS_ORIGIN=https://bugo-sync-list.onrender.com
FORCE_HTTPS=true
JWT_SECRET=[generate: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"]
HMAC_SECRET=[generate another]
JWT_EXPIRES_IN=2h
BCRYPT_ROUNDS=12
SEED_ADMIN_PASSWORD=BugoAdmin@Secure2026!#
SEED_RESIDENT_PASSWORD=BugoResident@Secure2026!#
```

### 5. Seed Database (2 min)
- Go to service → "Shell" tab
- Run: `npm run prisma:seed`

## 🎉 Done!

**Your URL:** https://bugo-sync-list.onrender.com

**Test:**
- Health: /api/health
- Login: admin@bugo.gov.ph / (your SEED_ADMIN_PASSWORD)

## 📖 Full Guide
See: **YOUR_RENDER_DEPLOYMENT_STEPS.md**
