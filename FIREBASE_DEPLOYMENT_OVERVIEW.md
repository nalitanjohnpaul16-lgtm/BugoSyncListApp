# Firebase Cloud Run Deployment Overview

## Visual Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                      END USERS                                 │
│           (Barangay Bugo Residents & Admin)                    │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                  Firebase Hosting                              │
│            (https://bugo-resident-assist.web.app)             │
│                                                                │
│  Frontend: React SPA (dist/index.html + assets/)              │
│  - Static HTML/CSS/JS                                         │
│  - Served via Global CDN                                      │
│  - Auto SSL Certificate                                       │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         │ /api/** requests
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                   Google Cloud Run                             │
│         (https://bugo-sync-list-xxx.a.run.app)                │
│                                                                │
│  Backend: Express.js Server (dist/server.mjs)                 │
│  - Docker Container (Node.js 22)                              │
│  - Auto-scaling (1-10 instances)                              │
│  - 512MB RAM, 1 CPU                                           │
│  - JWT Authentication                                         │
│  - RBAC Middleware                                            │
│  - Helmet Security Headers                                    │
│                                                                │
│  Environment Variables:                                        │
│  - NODE_ENV=production                                        │
│  - DATABASE_URL (from Secret Manager)                         │
│  - JWT_SECRET (from Secret Manager)                           │
│  - HMAC_SECRET (from Secret Manager)                          │
│  - APP_URL, CORS_ORIGIN                                       │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         │ Prisma ORM
                         │ Cloud SQL Connector
                         ▼
┌────────────────────────────────────────────────────────────────┐
│              Google Cloud SQL (MySQL 8.0)                      │
│         (bugo-mysql.asia-southeast1)                          │
│                                                                │
│  Database: barangay_bugo_db                                   │
│  - Managed MySQL 8.0                                          │
│  - Automated Daily Backups (02:00 PHT)                        │
│  - 7-day Backup Retention                                     │
│  - TLS/SSL Encryption                                         │
│  - Connection via Unix Socket (/cloudsql/...)                 │
│                                                                │
│  Tables:                                                       │
│  - users (admin, residents)                                   │
│  - assistance_programs (44 services)                          │
│  - assistance_applications                                    │
│  - announcements                                              │
│  - census_puroks                                              │
│  - notifications                                              │
│  - activity_logs                                              │
│  - archived_records                                           │
└────────────────────────────────────────────────────────────────┘


Supporting Services:
┌────────────────────────────────────────────────────────────────┐
│  Google Secret Manager                                         │
│  - DATABASE_URL                                                │
│  - JWT_SECRET                                                  │
│  - HMAC_SECRET                                                 │
│  - SEED_ADMIN_PASSWORD                                         │
│  - SEED_RESIDENT_PASSWORD                                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Google Container Registry                                     │
│  - gcr.io/PROJECT_ID/bugo-sync-list:latest                    │
│  - Docker images stored and versioned                          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Cloud Build (Optional CI/CD)                                  │
│  - Automated builds on git push                                │
│  - Runs cloudbuild.yaml                                        │
│  - Auto-deploy to Cloud Run                                    │
└────────────────────────────────────────────────────────────────┘
```

---

## Deployment Flow

```
Developer Machine                Google Cloud Platform
─────────────────                ─────────────────────

1. Code Changes
   ├─ src/
   ├─ server.ts
   └─ package.json
        │
        ▼
2. npm run build
   ├─ Frontend: Vite build → dist/
   └─ Backend: esbuild → dist/server.mjs
        │
        ▼
3. docker build
   Creates container image
        │
        │  docker push
        ▼
   ┌─────────────────────────┐
   │ Container Registry      │
   │ gcr.io/PROJECT/app      │
   └─────────────────────────┘
        │
        ▼
   ┌─────────────────────────┐
   │ Cloud Run               │
   │ Deploys new version     │
   │ Rolling update (0 down) │
   └─────────────────────────┘
        │
        ▼
4. firebase deploy
        │
        ▼
   ┌─────────────────────────┐
   │ Firebase Hosting        │
   │ Deploys static files    │
   │ Updates CDN cache       │
   └─────────────────────────┘
```

---

## File Structure for Firebase Deployment

```
BugoSyncListApp-main/
│
├── 🔧 Firebase Configuration
│   ├── Dockerfile              # Container definition
│   ├── .dockerignore           # Ignore unnecessary files
│   ├── firebase.json           # Firebase Hosting config
│   ├── .firebaserc             # Firebase project mapping
│   └── cloudbuild.yaml         # Automated CI/CD config
│
├── 📦 Build Artifacts
│   └── dist/
│       ├── index.html          # Frontend entry (→ Firebase Hosting)
│       ├── assets/             # CSS/JS bundles (→ Firebase Hosting)
│       │   ├── index-*.css
│       │   └── index-*.js
│       ├── favicon.svg         # (→ Firebase Hosting)
│       └── server.mjs          # Backend bundle (→ Cloud Run)
│
├── 🗄️ Database
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Version-controlled migrations
│   │   └── seed.ts             # Initial data
│   └── .env                    # Local DATABASE_URL
│
├── 📜 Deployment Scripts
│   └── scripts/
│       ├── firebase-deploy.sh  # Bash deployment script
│       └── firebase-deploy.ps1 # PowerShell deployment script
│
├── 📚 Documentation
│   ├── FIREBASE_DEPLOYMENT.md      # Complete guide
│   ├── FIREBASE_QUICKSTART.md      # Quick start (20 min)
│   ├── FIREBASE_DEPLOYMENT_OVERVIEW.md  # This file
│   └── DEPLOYMENT_COMPARISON.md     # Platform comparison
│
└── 🔐 Environment Configuration
    ├── .env.production         # Production template
    └── Google Secret Manager   # Actual production secrets
```

---

## Security Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    Security Layers                             │
└────────────────────────────────────────────────────────────────┘

1️⃣ Network Layer
   ├─ Firebase Hosting: HTTPS only (auto SSL)
   ├─ Cloud Run: HTTPS only
   └─ Cloud SQL: Private IP + Cloud SQL Proxy

2️⃣ Application Layer (Express.js)
   ├─ Helmet: Security headers (CSP, X-Frame-Options, etc.)
   ├─ CORS: Restricted to Firebase Hosting origin
   ├─ Rate Limiting: 5 failed logins = 60s lockout
   └─ Input Validation: All user inputs sanitized

3️⃣ Authentication Layer
   ├─ JWT: 2-hour expiration, signed with HMAC_SECRET
   ├─ Bcrypt: 12 rounds for password hashing
   └─ RBAC: Role-based access control (admin vs resident)

4️⃣ Database Layer
   ├─ Prisma ORM: Parameterized queries (SQL injection proof)
   ├─ Cloud SQL: TLS encryption in transit
   ├─ Secret Manager: Encrypted credentials at rest
   └─ Automated Backups: 7-day retention

5️⃣ Secrets Management
   ├─ Google Secret Manager: Encrypted storage
   ├─ IAM Policies: Service account access only
   └─ Never in code: All secrets via environment variables
```

---

## Cost Breakdown Example (Medium Traffic)

```
Monthly Traffic:
├─ 2,000 unique users
├─ 50,000 page views
└─ 200,000 API requests

Firebase Hosting:
├─ Storage: 100 MB                    $0.00 (within free tier)
├─ Bandwidth: 5 GB                    $0.00 (within free tier)
└─ Total                              $0.00

Cloud Run:
├─ Requests: 200,000                  $0.00 (within free tier)
├─ CPU Time: 50,000 vCPU-sec         $0.00 (within free tier)
├─ Memory: 25 GB-sec                  $0.00 (within free tier)
└─ Total                              $0.00

Cloud SQL (db-f1-micro):
├─ Instance: 0.6GB RAM                $7.67
├─ Storage: 10 GB SSD                 $1.70
├─ Backups: 10 GB (7 days)           $0.80
└─ Total                              $10.17

────────────────────────────────────
TOTAL MONTHLY COST                    $10.17
────────────────────────────────────

Note: Both Cloud Run and Firebase Hosting have generous
free tiers. Most costs come from Cloud SQL database.

Scaling Example (High Traffic):
├─ 10,000 users, 500,000 requests/month
├─ Cloud SQL (db-n1-standard-1)      $50-70
├─ Cloud Run (scaled)                 $10-20
├─ Firebase Hosting                   $5-10
└─ Total                              $65-100/month
```

---

## Deployment Checklist

### Prerequisites ✓
- [ ] Google Cloud account created
- [ ] Firebase project created
- [ ] Project ID noted
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Google Cloud SDK installed
- [ ] Docker Desktop installed and running
- [ ] Logged in: `firebase login` and `gcloud auth login`

### Initial Setup ✓
- [ ] APIs enabled (Cloud Run, Cloud SQL, Cloud Build, Secret Manager)
- [ ] Cloud SQL instance created (`bugo-mysql`)
- [ ] Database created (`barangay_bugo_db`)
- [ ] Database user created (`bugo_app_user`)
- [ ] Connection name saved
- [ ] Secrets created in Secret Manager
- [ ] IAM permissions granted to service account

### Application Configuration ✓
- [ ] `.firebaserc` updated with project ID
- [ ] `firebase.json` configured
- [ ] `Dockerfile` reviewed
- [ ] `.dockerignore` configured
- [ ] Application built (`npm run build`)

### Deployment ✓
- [ ] Docker image built
- [ ] Image pushed to Container Registry
- [ ] Cloud Run service deployed
- [ ] Cloud SQL connection configured
- [ ] Secrets attached to Cloud Run
- [ ] Database migrations run
- [ ] Database seeded
- [ ] Firebase Hosting deployed
- [ ] Environment variables updated with Firebase URL

### Verification ✓
- [ ] Health endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] Admin can login
- [ ] Resident can register and login
- [ ] Application creation works
- [ ] Database queries execute correctly
- [ ] No console errors in browser

### Post-Deployment ✓
- [ ] Admin password changed
- [ ] Test accounts removed or updated
- [ ] Custom domain configured (optional)
- [ ] Monitoring enabled
- [ ] Backup schedule verified
- [ ] Documentation updated with URLs

---

## Support & Resources

### Documentation
- **Quick Start:** FIREBASE_QUICKSTART.md (20-minute guide)
- **Complete Guide:** FIREBASE_DEPLOYMENT.md (step-by-step)
- **Comparison:** DEPLOYMENT_COMPARISON.md (vs other platforms)

### Official Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Prisma on Google Cloud](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-google-cloud)

### Community Support
- [Firebase Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [Google Cloud Community](https://www.googlecloudcommunity.com/)
- [Prisma Discord](https://discord.gg/prisma)

### Troubleshooting
- Check logs: `gcloud run services logs read bugo-sync-list`
- View metrics: [Cloud Run Console](https://console.cloud.google.com/run)
- Database status: `gcloud sql instances describe bugo-mysql`
- Secret access: `gcloud secrets versions access latest --secret=DATABASE_URL`

---

## What's Next?

1. **Follow FIREBASE_QUICKSTART.md** for 20-minute deployment
2. **Test thoroughly** with real users
3. **Monitor performance** via Cloud Console
4. **Set up CI/CD** with Cloud Build (optional)
5. **Add custom domain** when ready
6. **Scale resources** based on usage

---

**Your Express app is ready for Firebase Cloud Run deployment!**  
All necessary files and documentation have been created.
