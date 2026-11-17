# ==============================================================================
# Bugo Sync List - MySQL Database Restore Script (PowerShell for Windows)
# Usage:
#   .\scripts\restore_mysql.ps1 -BackupFile "backups\barangay_bugo_20261118_034016.sql.zip"
# ==============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

# Validate backup file exists
if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found: $BackupFile"
    exit 1
}

# Check if mysql is available
if (-not (Get-Command mysql -ErrorAction SilentlyContinue)) {
    Write-Error "Error: mysql is not installed or not on PATH."
    Write-Error "Install MySQL Client tools and add to PATH, then retry."
    exit 1
}

# Load DATABASE_URL from .env file
$databaseUrl = $null
Get-Content .env | ForEach-Object {
    if ($_ -match '^DATABASE_URL="(.+)"$') {
        $databaseUrl = $matches[1]
    }
}

if (-not $databaseUrl) {
    Write-Error "DATABASE_URL not found in .env file"
    exit 1
}

# Parse DATABASE_URL
$uri = [System.Uri]$databaseUrl
$MYSQL_HOST = $uri.Host
$MYSQL_PORT = if ($uri.Port -gt 0) { $uri.Port } else { 3306 }
$MYSQL_USER = [System.Web.HttpUtility]::UrlDecode($uri.UserInfo.Split(':')[0])
$MYSQL_PASSWORD = [System.Web.HttpUtility]::UrlDecode($uri.UserInfo.Split(':')[1])
$MYSQL_DATABASE = $uri.AbsolutePath.TrimStart('/')

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MySQL Database Restore" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Host: $MYSQL_HOST"
Write-Host "Port: $MYSQL_PORT"
Write-Host "Database: $MYSQL_DATABASE"
Write-Host "Backup File: $BackupFile"
Write-Host ""

# Extract SQL file if compressed
$sqlFile = $null
$tempExtract = $false

if ($BackupFile -match '\.(zip|gz)$') {
    Write-Host "Extracting compressed backup..." -ForegroundColor Yellow
    $tempDir = Join-Path $env:TEMP "mysql_restore_$(Get-Date -Format 'yyyyMMddHHmmss')"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    
    if ($BackupFile -match '\.zip$') {
        Expand-Archive -Path $BackupFile -DestinationPath $tempDir -Force
        $sqlFile = Get-ChildItem -Path $tempDir -Filter "*.sql" | Select-Object -First 1 -ExpandProperty FullName
    } else {
        # For .gz files, would need external tool or PowerShell 7+ cmdlets
        Write-Error "Direct .gz extraction not supported in PowerShell 5.1. Please extract manually or use .zip format."
        exit 1
    }
    
    $tempExtract = $true
    Write-Host "Extracted to: $sqlFile" -ForegroundColor Green
} else {
    $sqlFile = $BackupFile
}

if (-not (Test-Path $sqlFile)) {
    Write-Error "SQL file not found after extraction: $sqlFile"
    exit 1
}

# Confirm before proceeding
Write-Host ""
Write-Warning "This will DROP and recreate the database '$MYSQL_DATABASE'."
Write-Host "All existing data will be LOST." -ForegroundColor Red
$confirmation = Read-Host "Type 'YES' to continue or anything else to cancel"

if ($confirmation -ne 'YES') {
    Write-Host "Restore cancelled." -ForegroundColor Yellow
    if ($tempExtract) {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    exit 0
}

Write-Host ""
Write-Host "Starting restore process..." -ForegroundColor Green

# Set password environment variable
$env:MYSQL_PWD = $MYSQL_PASSWORD

try {
    # Drop and recreate database
    Write-Host "Dropping existing database..." -ForegroundColor Yellow
    mysql --host="$MYSQL_HOST" --port="$MYSQL_PORT" --user="$MYSQL_USER" -e "DROP DATABASE IF EXISTS ``$MYSQL_DATABASE``;"
    
    Write-Host "Creating fresh database..." -ForegroundColor Yellow
    mysql --host="$MYSQL_HOST" --port="$MYSQL_PORT" --user="$MYSQL_USER" -e "CREATE DATABASE ``$MYSQL_DATABASE`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    
    # Restore from backup
    Write-Host "Restoring data from backup..." -ForegroundColor Yellow
    Get-Content $sqlFile | mysql --host="$MYSQL_HOST" --port="$MYSQL_PORT" --user="$MYSQL_USER" "$MYSQL_DATABASE"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Database restored successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
} catch {
    Write-Error "Restore failed: $_"
    exit 1
} finally {
    # Clear password from environment
    $env:MYSQL_PWD = $null
    
    # Clean up temporary files
    if ($tempExtract) {
        Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Verify restore
Write-Host ""
Write-Host "Verifying restored tables..." -ForegroundColor Cyan
$env:MYSQL_PWD = $MYSQL_PASSWORD
mysql --host="$MYSQL_HOST" --port="$MYSQL_PORT" --user="$MYSQL_USER" "$MYSQL_DATABASE" -e "SHOW TABLES;"
$env:MYSQL_PWD = $null

Write-Host ""
Write-Host "Restore complete! Run 'npm run prisma:generate' to sync Prisma client." -ForegroundColor Green
