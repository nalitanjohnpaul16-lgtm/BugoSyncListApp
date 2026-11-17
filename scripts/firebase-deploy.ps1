# Firebase Cloud Run Deployment Script (PowerShell)
# Automates the deployment process for Barangay Bugo Resident Assistance Management System

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Firebase Cloud Run Deployment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if PROJECT_ID is set
if (-not $env:PROJECT_ID) {
    Write-Host "Error: PROJECT_ID environment variable not set" -ForegroundColor Red
    Write-Host "Set it with: `$env:PROJECT_ID = 'your-firebase-project-id'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Project ID: $env:PROJECT_ID`n" -ForegroundColor Green

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

$missingTools = @()

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    $missingTools += "gcloud CLI - https://cloud.google.com/sdk/docs/install"
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    $missingTools += "Docker - https://www.docker.com/get-started"
}

if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    $missingTools += "Firebase CLI - npm install -g firebase-tools"
}

if ($missingTools.Count -gt 0) {
    Write-Host "`nError: Missing required tools:" -ForegroundColor Red
    $missingTools | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "[OK] All prerequisites installed`n" -ForegroundColor Green

# Set project
Write-Host "Setting Google Cloud project..." -ForegroundColor Yellow
gcloud config set project $env:PROJECT_ID

# Build application
Write-Host "`nBuilding application..." -ForegroundColor Yellow
npm run build

if (-not (Test-Path "dist/index.html") -or -not (Test-Path "dist/server.mjs")) {
    Write-Host "Error: Build failed. dist/ directory missing required files" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Build complete`n" -ForegroundColor Green

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t "gcr.io/$env:PROJECT_ID/bugo-sync-list:latest" .
Write-Host "[OK] Docker image built`n" -ForegroundColor Green

# Push to Google Container Registry
Write-Host "Pushing to Google Container Registry..." -ForegroundColor Yellow
docker push "gcr.io/$env:PROJECT_ID/bugo-sync-list:latest"
Write-Host "[OK] Image pushed`n" -ForegroundColor Green

# Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy bugo-sync-list `
  --image "gcr.io/$env:PROJECT_ID/bugo-sync-list:latest" `
  --platform managed `
  --region asia-southeast1 `
  --allow-unauthenticated `
  --min-instances 1 `
  --max-instances 10 `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300

Write-Host "[OK] Cloud Run deployment complete`n" -ForegroundColor Green

# Get Cloud Run URL
$cloudRunUrl = gcloud run services describe bugo-sync-list --region asia-southeast1 --format="value(status.url)"
Write-Host "Cloud Run URL: $cloudRunUrl`n" -ForegroundColor Cyan

# Deploy to Firebase Hosting
Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Frontend URL: https://$env:PROJECT_ID.web.app" -ForegroundColor Cyan
Write-Host "Backend URL: $cloudRunUrl`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update Cloud Run environment variables with Firebase URL" -ForegroundColor White
Write-Host "2. Run database migrations (see FIREBASE_DEPLOYMENT.md Step 5)" -ForegroundColor White
Write-Host "3. Verify deployment: curl https://$env:PROJECT_ID.web.app/api/health`n" -ForegroundColor White
