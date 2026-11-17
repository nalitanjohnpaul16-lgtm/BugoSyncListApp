# Production Startup Script for Barangay Bugo Resident Assistance Management System
# This script starts the production server with proper environment configuration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Barangay Bugo Production Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if production build exists
if (-not (Test-Path "dist/server.mjs")) {
    Write-Host "[ERROR] Production build not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "dist/index.html")) {
    Write-Host "[ERROR] Frontend build not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}

Write-Host "[✓] Production build artifacts verified" -ForegroundColor Green

# Check environment configuration
if (-not (Test-Path ".env")) {
    Write-Host "[WARNING] .env file not found. Using defaults." -ForegroundColor Yellow
}

# Verify critical environment variables
$envContent = Get-Content .env -ErrorAction SilentlyContinue
$hasJwtSecret = $envContent | Select-String "JWT_SECRET=" | Where-Object { $_ -notmatch "REPLACE_WITH" }
$hasHmacSecret = $envContent | Select-String "HMAC_SECRET=" | Where-Object { $_ -notmatch "REPLACE_WITH" }
$hasDatabaseUrl = $envContent | Select-String "DATABASE_URL="

if (-not $hasJwtSecret) {
    Write-Host "[ERROR] JWT_SECRET not configured in .env" -ForegroundColor Red
    Write-Host "Generate with: node -e `"console.log(require('crypto').randomBytes(48).toString('hex'))`"" -ForegroundColor Yellow
    exit 1
}

if (-not $hasHmacSecret) {
    Write-Host "[ERROR] HMAC_SECRET not configured in .env" -ForegroundColor Red
    Write-Host "Generate with: node -e `"console.log(require('crypto').randomBytes(48).toString('hex'))`"" -ForegroundColor Yellow
    exit 1
}

if (-not $hasDatabaseUrl) {
    Write-Host "[WARNING] DATABASE_URL not configured. Using JSON fallback mode." -ForegroundColor Yellow
}

Write-Host "[✓] Environment configuration validated" -ForegroundColor Green
Write-Host ""

# Start production server
Write-Host "Starting production server..." -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Health check endpoint: http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Set NODE_ENV to production
$env:NODE_ENV = "production"

# Start the server
npm start
