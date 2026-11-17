# Firebase Cloud Run Deployment Guide
## Barangay Bugo Resident Assistance Management System

This guide covers deploying the Express.js backend to **Google Cloud Run** (containerized) and the React frontend to **Firebase Hosting**, with MySQL database on **Cloud SQL**.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Hosting                        │
│              (React Frontend - dist/*)                      │
│         https://your-project.web.app                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ /api/** requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Cloud Run                          │
│               (Express Server - Containerized)               │
│    https://bugo-sync-list-xxx.a.run.app                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Google Cloud SQL (MySQL 8.0)               │
│            (Managed MySQL Database with TLS)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

### 1. Google Cloud / Firebase Account Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Install Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install
# Or use:
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login to Google Cloud
gcloud auth login
```

### 2. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `bugo-resident-assist` (or your choice)
4. Enable Google Analytics (optional)
5. Wait for project creation
6. Note your **Project ID**

### 3. Enable Required APIs
```bash
# Set your project ID
export PROJECT_ID="your-firebase-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  vpcaccess.googleapis.com \
  cloudresourcemanager.googleapis.com \
  compute.googleapis.com
```

### 4. Install Docker
- **Windows:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **macOS:** Docker Desktop
- **Linux:** `sudo apt install docker.io` or `brew install docker`

Verify installation:
```bash
docker --version
```

---

## 🗄️ Step 1: Create Cloud SQL MySQL Instance

### Option A: Using gcloud CLI (Recommended)
```bash
# Create MySQL 8.0 instance in asia-southeast1 (Singapore - closest to CDO, Philippines)
gcloud sql instances create bugo-mysql \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=asia-southeast1 \
  --root-password="CHANGE_ME_STRONG_ROOT_PASSWORD" \
  --backup-start-time="02:00" \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=3 \
  --enable-bin-log \
  --retained-backups-count=7

# Wait for instance to be ready (takes 5-10 minutes)
gcloud sql instances list

# Create database
gcloud sql databases create barangay_bugo_db \
  --instance=bugo-mysql \
  --charset=utf8mb4 \
  --collation=utf8mb4_unicode_ci

# Create user
gcloud sql users create bugo_app_user \
  --instance=bugo-mysql \
  --password="CHANGE_ME_STRONG_APP_PASSWORD"

# Get connection name (you'll need this)
gcloud sql instances describe bugo-mysql --format="value(connectionName)"
# Output example: your-project-id:asia-southeast1:bugo-mysql
```

### Option B: Using Google Cloud Console
1. Go to [Cloud SQL Console](https://console.cloud.google.com/sql/)
2. Click "Create Instance" → "MySQL"
3. Configure:
   - **Instance ID:** `bugo-mysql`
   - **Root Password:** (set strong password)
   - **Version:** MySQL 8.0
   - **Region:** `asia-southeast1` (Singapore)
   - **Machine Type:** Shared core (db-f1-micro for testing)
   - **Storage:** 10 GB SSD
   - **Automated Backups:** Enable (02:00 PHT)
4. Create instance (wait 5-10 minutes)
5. Create database `barangay_bugo_db`
6. Create user `bugo_app_user`

---

## 🐳 Step 2: Build and Test Docker Image Locally

### Build Docker Image
```bash
# Build the image
docker build -t bugo-sync-list .

# Verify image was created
docker images | grep bugo-sync-list
```

### Test Locally with Docker
```bash
# Run with environment variables
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e DATABASE_URL="mysql://bugo_app_user:PASSWORD@HOST:3306/barangay_bugo_db" \
  -e JWT_SECRET="your-jwt-secret" \
  -e HMAC_SECRET="your-hmac-secret" \
  -e APP_URL="http://localhost:8080" \
  -e CORS_ORIGIN="http://localhost:8080" \
  bugo-sync-list

# Test health endpoint
curl http://localhost:8080/api/health

# Stop container
docker ps  # Get container ID
docker stop <container-id>
```

---

## ☁️ Step 3: Deploy Backend to Cloud Run

### Configure Firebase Project
```bash
# Initialize Firebase in your project
firebase init

# Select:
# - Hosting: Configure files for Firebase Hosting
# - Use existing project: Select your project
# - Public directory: dist
# - Single-page app: Yes
# - GitHub integration: No (for now)
```

### Update .firebaserc with Your Project ID
```bash
# Edit .firebaserc
{
  "projects": {
    "default": "YOUR_ACTUAL_PROJECT_ID"
  }
}
```

### Build Application
```bash
# Build frontend and backend
npm run build

# Verify dist/ directory contains:
# - index.html
# - assets/
# - server.mjs
```

### Deploy to Cloud Run (Manual First Deploy)
```bash
# Build and push Docker image to Google Container Registry
docker tag bugo-sync-list gcr.io/$PROJECT_ID/bugo-sync-list:latest
docker push gcr.io/$PROJECT_ID/bugo-sync-list:latest

# Deploy to Cloud Run
gcloud run deploy bugo-sync-list \
  --image gcr.io/$PROJECT_ID/bugo-sync-list:latest \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,HMAC_SECRET=HMAC_SECRET:latest"

# Get the service URL
gcloud run services describe bugo-sync-list --region asia-southeast1 --format="value(status.url)"
# Output example: https://bugo-sync-list-abc123-as.a.run.app
```

### Connect Cloud Run to Cloud SQL
```bash
# Get Cloud SQL connection name
INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe bugo-mysql --format="value(connectionName)")

# Update Cloud Run service to use Cloud SQL
gcloud run services update bugo-sync-list \
  --region asia-southeast1 \
  --add-cloudsql-instances $INSTANCE_CONNECTION_NAME
```

---

## 🔐 Step 4: Configure Secrets

### Using Google Secret Manager (Recommended)
```bash
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create secrets
echo -n "mysql://bugo_app_user:YOUR_PASSWORD@/barangay_bugo_db?host=/cloudsql/YOUR_CONNECTION_NAME&sslaccept=strict" | \
  gcloud secrets create DATABASE_URL --data-file=-

echo -n "$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")" | \
  gcloud secrets create JWT_SECRET --data-file=-

echo -n "$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")" | \
  gcloud secrets create HMAC_SECRET --data-file=-

echo -n "BugoAdmin@Production2026!#" | \
  gcloud secrets create SEED_ADMIN_PASSWORD --data-file=-

echo -n "BugoResident@Production2026!#" | \
  gcloud secrets create SEED_RESIDENT_PASSWORD --data-file=-

# Grant Cloud Run service account access to secrets
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for secret in DATABASE_URL JWT_SECRET HMAC_SECRET SEED_ADMIN_PASSWORD SEED_RESIDENT_PASSWORD; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Update Cloud Run to Use Secrets
```bash
gcloud run services update bugo-sync-list \
  --region asia-southeast1 \
  --update-secrets \
    DATABASE_URL=DATABASE_URL:latest,\
    JWT_SECRET=JWT_SECRET:latest,\
    HMAC_SECRET=HMAC_SECRET:latest,\
    SEED_ADMIN_PASSWORD=SEED_ADMIN_PASSWORD:latest,\
    SEED_RESIDENT_PASSWORD=SEED_RESIDENT_PASSWORD:latest
```

---

## 🗃️ Step 5: Run Database Migrations

### Option A: Cloud Shell (Easiest)
```bash
# Open Cloud Shell in Google Cloud Console
# Clone your repository
git clone <your-repo-url>
cd BugoSyncListApp-main

# Install dependencies
npm install

# Set DATABASE_URL environment variable
export DATABASE_URL="mysql://bugo_app_user:PASSWORD@/barangay_bugo_db?host=/cloudsql/CONNECTION_NAME"

# Run migrations
npx prisma migrate deploy

# Seed database
npm run prisma:seed
```

### Option B: Local with Cloud SQL Proxy
```bash
# Download Cloud SQL Proxy
# Windows:
curl -o cloud-sql-proxy.exe https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.x64.exe

# macOS/Linux:
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy

# Start proxy
./cloud-sql-proxy --port 3306 YOUR_CONNECTION_NAME

# In another terminal, run migrations
export DATABASE_URL="mysql://bugo_app_user:PASSWORD@127.0.0.1:3306/barangay_bugo_db"
npx prisma migrate deploy
npm run prisma:seed
```

---

## 🌐 Step 6: Deploy Frontend to Firebase Hosting

### Update firebase.json with Cloud Run URL
```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "bugo-sync-list",
          "region": "asia-southeast1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Deploy to Firebase Hosting
```bash
# Deploy
firebase deploy --only hosting

# Your app will be available at:
# https://YOUR_PROJECT_ID.web.app
# https://YOUR_PROJECT_ID.firebaseapp.com
```

### Update Environment Variables with Firebase URL
```bash
# Get your Firebase Hosting URL
FIREBASE_URL="https://YOUR_PROJECT_ID.web.app"

# Update Cloud Run environment variables
gcloud run services update bugo-sync-list \
  --region asia-southeast1 \
  --update-env-vars \
    APP_URL=$FIREBASE_URL,\
    CORS_ORIGIN=$FIREBASE_URL,\
    FORCE_HTTPS=true
```

---

## ✅ Step 7: Verify Deployment

### Health Check
```bash
# Check Cloud Run backend
curl https://bugo-sync-list-xxx.a.run.app/api/health

# Check Firebase Hosting
curl https://YOUR_PROJECT_ID.web.app/api/health
```

### Run Full Verification
```bash
# Set verification URL
export VERIFY_BASE_URL="https://YOUR_PROJECT_ID.web.app"

# Run verification suite
npm run verify:deploy
```

### Test in Browser
1. Open `https://YOUR_PROJECT_ID.web.app`
2. Register as a new resident
3. Login with admin credentials
4. Test application creation
5. Check browser console for errors

---

## 🔄 Automated Deployment (CI/CD)

### Setup Cloud Build Triggers
```bash
# Connect GitHub repository
gcloud beta builds triggers create github \
  --repo-name=YOUR_REPO_NAME \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml

# This will automatically deploy on every push to main branch
```

### Manual Deployment Command
```bash
# Build and deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Deploy frontend
firebase deploy --only hosting
```

---

## 💰 Cost Estimation

### Free Tier Limits (Always Free)
- **Firebase Hosting:** 10 GB storage, 360 MB/day transfer
- **Cloud Run:** 2 million requests/month, 360,000 GB-seconds/month
- **Cloud SQL:** Not in free tier

### Estimated Monthly Cost (Low Traffic)
- **Cloud SQL (db-f1-micro):** ~$7-10/month
- **Cloud Run:** $0-5/month (under free tier for low traffic)
- **Firebase Hosting:** $0 (under free tier)
- **Total:** ~$7-15/month

### Production Scaling (High Traffic)
- **Cloud SQL (db-n1-standard-1):** ~$50-70/month
- **Cloud Run (auto-scaling):** ~$20-50/month
- **Firebase Hosting:** ~$5-10/month
- **Total:** ~$75-130/month

---

## 🔧 Troubleshooting

### Issue: Cloud Run can't connect to Cloud SQL
**Solution:**
```bash
# Ensure Cloud SQL connection is configured
gcloud run services update bugo-sync-list \
  --add-cloudsql-instances YOUR_CONNECTION_NAME \
  --region asia-southeast1
```

### Issue: CORS errors in browser
**Solution:**
```bash
# Update CORS_ORIGIN to match Firebase Hosting URL
gcloud run services update bugo-sync-list \
  --update-env-vars CORS_ORIGIN=https://YOUR_PROJECT_ID.web.app \
  --region asia-southeast1
```

### Issue: Database migrations fail
**Solution:**
```bash
# Use Cloud Shell or Cloud SQL Proxy to run migrations
# See Step 5 above
```

### Issue: Container fails to start
**Solution:**
```bash
# Check Cloud Run logs
gcloud run services logs read bugo-sync-list \
  --region asia-southeast1 \
  --limit 50

# Test Docker image locally first
docker run -p 8080:8080 bugo-sync-list
```

---

## 📊 Monitoring & Maintenance

### View Logs
```bash
# Cloud Run logs
gcloud run services logs read bugo-sync-list --region asia-southeast1

# Cloud SQL logs
gcloud sql operations list --instance=bugo-mysql

# Firebase Hosting logs (in Firebase Console)
# https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting
```

### Backups
```bash
# Manual backup
gcloud sql backups create --instance=bugo-mysql

# List backups
gcloud sql backups list --instance=bugo-mysql

# Restore from backup
gcloud sql backups restore BACKUP_ID --backup-instance=bugo-mysql
```

### Update Deployment
```bash
# 1. Build new version
npm run build

# 2. Build Docker image
docker build -t gcr.io/$PROJECT_ID/bugo-sync-list:latest .

# 3. Push to registry
docker push gcr.io/$PROJECT_ID/bugo-sync-list:latest

# 4. Deploy to Cloud Run (will auto-update)
gcloud run deploy bugo-sync-list \
  --image gcr.io/$PROJECT_ID/bugo-sync-list:latest \
  --region asia-southeast1

# 5. Deploy frontend
firebase deploy --only hosting
```

---

## 🌟 Custom Domain Setup (Optional)

### Add Custom Domain to Firebase Hosting
```bash
# In Firebase Console
# 1. Go to Hosting section
# 2. Click "Add custom domain"
# 3. Enter your domain (e.g., assist.barangaybugo.gov.ph)
# 4. Add DNS records to your domain registrar
# 5. Wait for SSL certificate provisioning (auto)
```

### Update Environment Variables
```bash
gcloud run services update bugo-sync-list \
  --update-env-vars \
    APP_URL=https://your-custom-domain.com,\
    CORS_ORIGIN=https://your-custom-domain.com \
  --region asia-southeast1
```

---

## 📞 Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Google Cloud Support](https://cloud.google.com/support)

---

**Deployment Status:** Ready for Firebase Cloud Run  
**Estimated Setup Time:** 30-45 minutes  
**Difficulty:** Intermediate
