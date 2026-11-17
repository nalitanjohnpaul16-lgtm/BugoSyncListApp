# Firebase Cloud Run Quick Start Guide

## 🚀 Deploy in 20 Minutes

### Prerequisites (5 minutes)
```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Install Google Cloud SDK
# Windows: Download from https://cloud.google.com/sdk/docs/install
# macOS: brew install --cask google-cloud-sdk
# Linux: curl https://sdk.cloud.google.com | bash

# 3. Install Docker Desktop
# Download from https://www.docker.com/products/docker-desktop/

# 4. Login to both services
firebase login
gcloud auth login
```

### Step 1: Create Firebase Project (3 minutes)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name: `bugo-resident-assist`
4. Disable Google Analytics (optional)
5. Create project
6. **Copy your Project ID** (shown in settings)

### Step 2: Configure Project (2 minutes)
```bash
# Set your project ID
export PROJECT_ID="your-project-id-here"  # Linux/Mac
$env:PROJECT_ID = "your-project-id-here"  # Windows PowerShell

# Set Google Cloud project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com

# Update .firebaserc file
# Edit .firebaserc and replace "your-firebase-project-id" with your actual project ID
```

### Step 3: Create MySQL Database (5 minutes)
```bash
# Create Cloud SQL instance (takes 5-10 minutes)
gcloud sql instances create bugo-mysql \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=asia-southeast1 \
  --root-password="YOUR_STRONG_ROOT_PASSWORD_HERE"

# Create database
gcloud sql databases create barangay_bugo_db \
  --instance=bugo-mysql

# Create user
gcloud sql users create bugo_app_user \
  --instance=bugo-mysql \
  --password="YOUR_STRONG_APP_PASSWORD_HERE"

# Get connection name (save this!)
gcloud sql instances describe bugo-mysql --format="value(connectionName)"
```

### Step 4: Configure Secrets (3 minutes)
```bash
# Enable Secret Manager
gcloud services enable secretmanager.googleapis.com

# Create DATABASE_URL secret (replace YOUR_CONNECTION_NAME)
echo -n "mysql://bugo_app_user:YOUR_PASSWORD@/barangay_bugo_db?host=/cloudsql/YOUR_CONNECTION_NAME&sslaccept=strict" | \
  gcloud secrets create DATABASE_URL --data-file=-

# Create JWT secret
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))" | \
  gcloud secrets create JWT_SECRET --data-file=-

# Create HMAC secret
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))" | \
  gcloud secrets create HMAC_SECRET --data-file=-

# Grant Cloud Run access to secrets
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for secret in DATABASE_URL JWT_SECRET HMAC_SECRET; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Step 5: Deploy Application (5 minutes)
```bash
# Build application
npm run build

# Build Docker image
docker build -t gcr.io/$PROJECT_ID/bugo-sync-list:latest .

# Push to Container Registry
docker push gcr.io/$PROJECT_ID/bugo-sync-list:latest

# Deploy to Cloud Run with secrets
gcloud run deploy bugo-sync-list \
  --image gcr.io/$PROJECT_ID/bugo-sync-list:latest \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --add-cloudsql-instances $(gcloud sql instances describe bugo-mysql --format="value(connectionName)") \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,HMAC_SECRET=HMAC_SECRET:latest

# Deploy frontend to Firebase Hosting
firebase deploy --only hosting
```

### Step 6: Run Database Migrations (2 minutes)
```bash
# Option A: Cloud Shell (easiest)
# 1. Open Cloud Shell in Google Cloud Console
# 2. Clone your repo and run:
export DATABASE_URL="mysql://bugo_app_user:PASSWORD@/barangay_bugo_db?host=/cloudsql/CONNECTION_NAME"
npx prisma migrate deploy
npm run prisma:seed

# Option B: Local with Cloud SQL Proxy
# Download proxy: https://cloud.google.com/sql/docs/mysql/connect-instance-auth-proxy
# Run: ./cloud-sql-proxy YOUR_CONNECTION_NAME
# Then in another terminal:
export DATABASE_URL="mysql://bugo_app_user:PASSWORD@127.0.0.1:3306/barangay_bugo_db"
npx prisma migrate deploy
npm run prisma:seed
```

### Step 7: Update Environment Variables
```bash
# Get your Firebase URL
FIREBASE_URL="https://$PROJECT_ID.web.app"

# Update Cloud Run with Firebase URL
gcloud run services update bugo-sync-list \
  --region asia-southeast1 \
  --update-env-vars APP_URL=$FIREBASE_URL,CORS_ORIGIN=$FIREBASE_URL,FORCE_HTTPS=true
```

### Step 8: Verify Deployment
```bash
# Check health
curl https://$PROJECT_ID.web.app/api/health

# Should return:
# {"status":"ok","database":{"mode":"mysql-prisma","connected":true}}

# Open in browser
# https://YOUR_PROJECT_ID.web.app
```

---

## 🎯 One-Command Deployment (After Initial Setup)

```bash
# Set project ID
export PROJECT_ID="your-project-id"

# Run deployment script
bash scripts/firebase-deploy.sh

# Or on Windows:
powershell -ExecutionPolicy Bypass -File scripts/firebase-deploy.ps1
```

---

## 💰 Estimated Costs

**Development/Low Traffic:**
- Cloud SQL (db-f1-micro): ~$7-10/month
- Cloud Run: $0 (free tier)
- Firebase Hosting: $0 (free tier)
- **Total: ~$7-10/month**

**Production/High Traffic:**
- Cloud SQL (db-n1-standard-1): ~$50-70/month
- Cloud Run (scaled): ~$20-50/month
- Firebase Hosting: ~$5-10/month
- **Total: ~$75-130/month**

---

## 🔧 Common Issues

### Docker build fails
```bash
# Ensure Docker Desktop is running
docker ps

# Clean build cache
docker system prune -a
```

### Cloud Run deployment fails
```bash
# Check logs
gcloud run services logs read bugo-sync-list --region asia-southeast1

# Verify secrets are accessible
gcloud secrets versions access latest --secret="DATABASE_URL"
```

### Database connection fails
```bash
# Verify Cloud SQL connection is configured
gcloud run services describe bugo-sync-list \
  --region asia-southeast1 \
  --format="value(spec.template.spec.containers[0].resources.limits)"
```

### CORS errors
```bash
# Update CORS_ORIGIN
gcloud run services update bugo-sync-list \
  --region asia-southeast1 \
  --update-env-vars CORS_ORIGIN=https://YOUR_PROJECT_ID.web.app
```

---

## 📚 Full Documentation
- **FIREBASE_DEPLOYMENT.md** - Complete step-by-step guide
- **DEPLOYMENT.md** - General deployment documentation
- **PRODUCTION_DEPLOYMENT_CHECKLIST.md** - Production checklist

---

## 🆘 Need Help?
- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Stack Overflow - firebase](https://stackoverflow.com/questions/tagged/firebase)
- [Google Cloud Support](https://cloud.google.com/support)
