#!/bin/bash

# Firebase Cloud Run Deployment Script
# Automates the deployment process for Barangay Bugo Resident Assistance Management System

set -e  # Exit on error

echo "========================================"
echo "Firebase Cloud Run Deployment"
echo "========================================"
echo ""

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo "Error: PROJECT_ID environment variable not set"
    echo "Set it with: export PROJECT_ID=your-firebase-project-id"
    exit 1
fi

echo "Project ID: $PROJECT_ID"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "Error: Docker not found. Install from: https://www.docker.com/get-started"
    exit 1
fi

if ! command -v firebase &> /dev/null; then
    echo "Error: Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
fi

echo "✓ All prerequisites installed"
echo ""

# Set project
echo "Setting Google Cloud project..."
gcloud config set project $PROJECT_ID

# Build application
echo ""
echo "Building application..."
npm run build

if [ ! -f "dist/index.html" ] || [ ! -f "dist/server.mjs" ]; then
    echo "Error: Build failed. dist/ directory missing required files"
    exit 1
fi

echo "✓ Build complete"
echo ""

# Build Docker image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/bugo-sync-list:latest .
echo "✓ Docker image built"
echo ""

# Push to Google Container Registry
echo "Pushing to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/bugo-sync-list:latest
echo "✓ Image pushed"
echo ""

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy bugo-sync-list \
  --image gcr.io/$PROJECT_ID/bugo-sync-list:latest \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300

echo "✓ Cloud Run deployment complete"
echo ""

# Get Cloud Run URL
CLOUD_RUN_URL=$(gcloud run services describe bugo-sync-list --region asia-southeast1 --format="value(status.url)")
echo "Cloud Run URL: $CLOUD_RUN_URL"
echo ""

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "Frontend URL: https://$PROJECT_ID.web.app"
echo "Backend URL: $CLOUD_RUN_URL"
echo ""
echo "Next steps:"
echo "1. Update Cloud Run environment variables with Firebase URL"
echo "2. Run database migrations (see FIREBASE_DEPLOYMENT.md Step 5)"
echo "3. Verify deployment: curl https://$PROJECT_ID.web.app/api/health"
echo ""
