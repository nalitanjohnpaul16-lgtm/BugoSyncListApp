# Render.com Deployment Troubleshooting

## Issue: Blank Page After Deployment

### Problem
Render deployment shows "Deploy succeeded" but the page loads blank (white screen).

### Root Cause
Content Security Policy (CSP) headers were blocking:
1. OpenStreetMap tile images (`https://*.tile.openstreetmap.org`)
2. Tesseract.js OCR worker scripts (`https://unpkg.com`)
3. JavaScript eval needed by Tesseract

### Solution Applied ✅

Updated `server.ts` CSP headers to allow:

```typescript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval for Tesseract
    styleSrc: ["'self'", "'unsafe-inline'"],
    fontSrc: ["'self'", 'data:'],
    imgSrc: ["'self'", 'data:', 'blob:', 
             'https://api.dicebear.com', 
             'https://*.tile.openstreetmap.org',  // ✅ OpenStreetMap tiles
             'https://unpkg.com'],
    connectSrc: ["'self'", 'https://unpkg.com'],  // ✅ Tesseract downloads
    workerSrc: ["'self'", 'blob:', 'https://unpkg.com'],  // ✅ Tesseract workers
    childSrc: ["'self'", 'blob:'],
    frameAncestors: ["'self'"],
  }
}
```

### Changes Pushed to GitHub ✅

```
f06acad Fix CSP headers for OpenStreetMap tiles and Tesseract OCR workers
```

---

## How to Fix Your Render Deployment

### Option 1: Automatic Redeploy (Recommended)

Render auto-deploys when you push to GitHub. Since we just pushed the fix:

1. **Go to your Render dashboard**
2. **Check your service** - It should show "Deploying..." or already "Live"
3. **Wait for deployment** to complete (~2-3 minutes)
4. **Refresh your browser** on `https://bugosynclistapp1.onrender.com`
5. **Clear browser cache** if needed (Ctrl+Shift+R or Cmd+Shift+R)

### Option 2: Manual Redeploy

If auto-deploy didn't trigger:

1. Go to Render Dashboard → Your Service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for build to complete
4. Refresh your app URL

---

## Verification Steps

### 1. Check Render Logs

In Render Dashboard → Your Service → **Logs** tab:

**Look for:**
```
✓ 1745 modules transformed
dist/index.html      1.59 kB
dist/assets/index.css  96.91 kB
dist/assets/index.js  1,001.11 kB
✓ built in 13.46s
dist/server.mjs  256.9kb

Server listening on port 3000
Environment: production
Database: Connected
```

**Should NOT see:**
- `Content Security Policy` errors
- `refused to load` errors
- `blocked by CSP` warnings

### 2. Check Browser Console

Open your app → Press F12 → Console tab:

**Should NOT see:**
- ❌ `Refused to load script from 'https://unpkg.com'`
- ❌ `Refused to load image from 'https://tile.openstreetmap.org'`
- ❌ `Content Security Policy directive violated`

**Should see:**
- ✅ No CSP errors
- ✅ React app initialized
- ✅ Map tiles loading

### 3. Test the App

1. **Homepage loads** - Should see login page
2. **Login works** - Can authenticate
3. **Maps load** - Hazard map shows OpenStreetMap tiles
4. **ID upload works** - Tesseract OCR processes images

---

## If Still Showing Blank Page

### Debug Steps:

1. **Check Browser Console** (F12 → Console)
   - Copy any error messages
   - Look for CSP violations

2. **Check Network Tab** (F12 → Network)
   - Are files loading (index.html, index.js, index.css)?
   - What's the HTTP status? (200 OK, 404 Not Found, 403 Forbidden?)

3. **Check Render Logs**
   - Did build complete successfully?
   - Is server running on port 3000?
   - Any startup errors?

4. **Verify Environment Variables**
   - All 12 required variables set?
   - DATABASE_URL correct (Internal URL)?
   - APP_URL matches your Render service URL?

---

## Common Issues & Fixes

### Issue: "Cannot GET /"
**Cause:** Server not serving static files  
**Fix:** Check that `dist/index.html` was built

### Issue: JS/CSS files 404
**Cause:** Asset paths incorrect  
**Fix:** Verify build output in Render logs

### Issue: Database errors
**Cause:** DATABASE_URL incorrect or database not created  
**Fix:** 
1. Check DATABASE_URL is the **Internal** URL (not External)
2. Verify PostgreSQL database is running
3. Run migrations: `npx prisma migrate deploy`

### Issue: CORS errors
**Cause:** APP_URL/CORS_ORIGIN mismatch  
**Fix:** Both should be `https://bugosynclistapp1.onrender.com`

---

## Quick Health Check

Visit: `https://bugosynclistapp1.onrender.com/api/health`

**Should return:**
```json
{
  "status": "ok",
  "environment": "production",
  "database": {
    "mode": "postgresql-prisma",
    "connected": true
  }
}
```

If this works but homepage is blank → CSP issue (fixed now)  
If this doesn't work → Server/database issue

---

## Render Service Settings to Verify

### Build Command:
```bash
npm install && npm run build && npx prisma generate && npx prisma migrate deploy
```

### Start Command:
```bash
npm start
```

### Environment Variables (12 required):
```
NODE_ENV=production
DATABASE_URL=[Internal PostgreSQL URL]
PORT=3000
APP_URL=https://bugosynclistapp1.onrender.com
CORS_ORIGIN=https://bugosynclistapp1.onrender.com
FORCE_HTTPS=true
JWT_SECRET=[Your 64-char secret]
HMAC_SECRET=[Your 64-char secret]
JWT_EXPIRES_IN=2h
BCRYPT_ROUNDS=12
SEED_ADMIN_PASSWORD=BugoAdmin@Secure2026!#
SEED_RESIDENT_PASSWORD=BugoResident@Secure2026!#
```

---

## After Successful Deployment

### Seed the Database:

1. Go to Render Dashboard → Your Service → **Shell** tab
2. Wait for shell to connect
3. Run:
```bash
npm run prisma:seed
```
4. Wait for: **"Seed complete: 2 users, 44 services, 10 census puroks."**

### First Login:

**Admin:**
- Email: `admin@bugo.gov.ph`
- Password: `BugoAdmin@Secure2026!#`

**Resident:**
- Email: `resident@bugo.gov.ph`
- Password: `BugoResident@Secure2026!#`

---

## Still Need Help?

The CSP fix has been pushed to GitHub and should auto-deploy to Render.

**Wait 3-5 minutes for Render to rebuild**, then try again!

If issues persist, check:
1. Render build logs
2. Browser console errors
3. Environment variables configuration

---

**Latest Commit:** `f06acad` - CSP headers fixed for OpenStreetMap + Tesseract ✅
