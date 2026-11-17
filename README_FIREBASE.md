# Firebase Cloud Run Deployment - Quick Reference

## 🎯 What is This?

This is the **Firebase Cloud Run deployment package** for the Barangay Bugo Resident Assistance Management System. It allows you to deploy your Express.js backend and React frontend to Google's cloud infrastructure with enterprise-grade reliability and auto-scaling.

---

## 📦 What's Included

### Configuration Files
- **Dockerfile** - Container definition for Cloud Run
- **.dockerignore** - Build optimization
- **firebase.json** - Firebase Hosting + Cloud Run integration
- **.firebaserc** - Project configuration
- **cloudbuild.yaml** - CI/CD automation

### Deployment Scripts
- **scripts/firebase-deploy.sh** - One-command deployment (Linux/Mac)
- **scripts/firebase-deploy.ps1** - One-command deployment (Windows)

### Documentation (Choose One)
| Document | When to Use | Time |
|----------|-------------|------|
| **FIREBASE_QUICKSTART.md** ⭐ | First time deploying | 20 min |
| **FIREBASE_DEPLOYMENT.md** | Need detailed steps | 45 min |
| **FIREBASE_DEPLOYMENT_OVERVIEW.md** | Understand architecture | 10 min |
| **DEPLOYMENT_COMPARISON.md** | Compare platforms | 15 min |

---

## 🚀 Quick Start (20 Minutes)

### 1. Prerequisites
```bash
# Install tools
npm install -g firebase-tools
# Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
# Install Docker: https://www.docker.com/products/docker-desktop/

# Login
firebase login
gcloud auth login
```

### 2. Create Firebase Project
1. Visit https://console.firebase.google.com/
2. Click "Add Project"
3. Name: `bugo-resident-assist`
4. Copy your **Project ID**

### 3. Update Configuration
```bash
# Edit .firebaserc and replace "your-firebase-project-id" with your actual ID
```

### 4. Deploy
```bash
# Set project ID
export PROJECT_ID="your-project-id"  # Linux/Mac
$env:PROJECT_ID = "your-project-id"  # Windows

# Follow FIREBASE_QUICKSTART.md for complete steps
```

---

## 📚 Documentation Guide

### For Different Audiences

**🎓 First-Time Deployers**
→ Start with **FIREBASE_QUICKSTART.md**
- Step-by-step instructions
- Copy-paste commands
- 20-minute timeline

**👨‍💻 Experienced Developers**
→ Use **FIREBASE_DEPLOYMENT.md**
- Complete reference
- All configuration options
- Troubleshooting guide

**📊 Decision Makers**
→ Review **DEPLOYMENT_COMPARISON.md**
- Cost comparison
- Feature comparison
- Platform recommendations

**🏗️ System Architects**
→ Read **FIREBASE_DEPLOYMENT_OVERVIEW.md**
- Architecture diagrams
- Security layers
- Component interaction

---

## 💰 Pricing Quick Reference

| Usage | Monthly Cost |
|-------|-------------|
| **Testing** (100 users) | $7-10 |
| **Small** (500 users) | $10-20 |
| **Medium** (2,000 users) | $30-60 |
| **Large** (5,000+ users) | $75-130 |

**What's Free:**
- Firebase Hosting (10 GB storage, 360 MB/day)
- Cloud Run (2M requests, 360K GB-seconds/month)

**What Costs Money:**
- Cloud SQL MySQL (starts at $7/month)

---

## 🏗️ Architecture

```
Users → Firebase Hosting (React) → Cloud Run (Express) → Cloud SQL (MySQL)
```

**Benefits:**
- ✅ Auto-scaling (1-10 instances)
- ✅ Global CDN
- ✅ Automated backups
- ✅ 99.95% uptime SLA
- ✅ HTTPS everywhere (auto SSL)

---

## 🔧 Commands Reference

### Build & Deploy
```bash
# Build application
npm run build

# Build Docker image
docker build -t gcr.io/$PROJECT_ID/bugo-sync-list:latest .

# Push to registry
docker push gcr.io/$PROJECT_ID/bugo-sync-list:latest

# Deploy to Cloud Run
gcloud run deploy bugo-sync-list \
  --image gcr.io/$PROJECT_ID/bugo-sync-list:latest \
  --region asia-southeast1

# Deploy frontend
firebase deploy --only hosting
```

### Database Operations
```bash
# Run migrations
npx prisma migrate deploy

# Seed database
npm run prisma:seed

# Backup database
gcloud sql backups create --instance=bugo-mysql
```

### Monitoring
```bash
# View logs
gcloud run services logs read bugo-sync-list --region asia-southeast1

# Check health
curl https://your-project.web.app/api/health

# List deployments
gcloud run services list
```

---

## 🆘 Troubleshooting

### Docker Build Fails
```bash
# Ensure Docker is running
docker ps

# Clear cache
docker system prune -a
```

### Database Connection Issues
```bash
# Verify Cloud SQL connection
gcloud run services describe bugo-sync-list \
  --region asia-southeast1 \
  --format="value(spec.template.spec.containers[0].env)"
```

### CORS Errors
```bash
# Update CORS origin
gcloud run services update bugo-sync-list \
  --update-env-vars CORS_ORIGIN=https://your-project.web.app \
  --region asia-southeast1
```

**More troubleshooting:** See FIREBASE_DEPLOYMENT.md Section "Troubleshooting"

---

## 🔐 Security

Your deployment includes:
- ✅ HTTPS encryption (TLS 1.3)
- ✅ Google Secret Manager for credentials
- ✅ JWT authentication (2-hour expiration)
- ✅ RBAC (Role-Based Access Control)
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Helmet security headers
- ✅ CORS restrictions
- ✅ SQL injection prevention (Prisma ORM)

---

## 📊 Monitoring & Logs

### Firebase Console
- **URL:** https://console.firebase.google.com/
- **Monitor:** Hosting usage, visitor analytics

### Cloud Run Console
- **URL:** https://console.cloud.google.com/run
- **Monitor:** Request metrics, logs, scaling

### Cloud SQL Console
- **URL:** https://console.cloud.google.com/sql
- **Monitor:** Database performance, backups

---

## 🔄 Updates & Maintenance

### Deploy New Version
```bash
# 1. Build new version
npm run build

# 2. Build & push Docker image
docker build -t gcr.io/$PROJECT_ID/bugo-sync-list:latest .
docker push gcr.io/$PROJECT_ID/bugo-sync-list:latest

# 3. Cloud Run auto-updates (or use script)
bash scripts/firebase-deploy.sh
```

### Rollback
```bash
# List revisions
gcloud run revisions list --service bugo-sync-list

# Route traffic to previous revision
gcloud run services update-traffic bugo-sync-list \
  --to-revisions REVISION_NAME=100
```

---

## ✅ Deployment Checklist

- [ ] Firebase project created
- [ ] CLIs installed (firebase, gcloud, docker)
- [ ] Logged in to all services
- [ ] APIs enabled
- [ ] Cloud SQL instance created
- [ ] Secrets configured
- [ ] .firebaserc updated with project ID
- [ ] Application built
- [ ] Docker image built and pushed
- [ ] Cloud Run deployed
- [ ] Database migrated and seeded
- [ ] Firebase Hosting deployed
- [ ] Environment variables updated
- [ ] Health check passed
- [ ] Browser testing completed

---

## 📞 Support

### Documentation
- **Quick:** FIREBASE_QUICKSTART.md
- **Complete:** FIREBASE_DEPLOYMENT.md
- **Overview:** FIREBASE_DEPLOYMENT_OVERVIEW.md
- **Compare:** DEPLOYMENT_COMPARISON.md

### Official Resources
- [Firebase Docs](https://firebase.google.com/docs)
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Cloud SQL Docs](https://cloud.google.com/sql/docs)

### Community
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)
- [Google Cloud Community](https://www.googlecloudcommunity.com/)

---

## 🌟 Why Choose Firebase Cloud Run?

✅ **Enterprise-grade** - Google's infrastructure  
✅ **Auto-scaling** - 10 to 10,000 users seamlessly  
✅ **No code changes** - Your Express app works as-is  
✅ **99.95% uptime** - SLA guarantee  
✅ **Global reach** - CDN + multi-region  
✅ **Easy updates** - Zero-downtime deployments  

---

## 🎯 Next Step

**Open FIREBASE_QUICKSTART.md and start deploying!**

Estimated time: 20-30 minutes  
Difficulty: Medium  
Result: Production-ready system on Google Cloud
