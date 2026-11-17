# ==============================================================================
# Bugo Sync List - Automated MySQL Backup Script (PowerShell for Windows)
# Usage:
#   $env:DATABASE_URL="mysql://user:pass@host:3306/barangay_bugo_db"; .\scripts\backup_mysql.ps1
#   or set MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
# ==============================================================================

$ErrorActionPreference = "Stop"

$BACKUP_DIR = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { ".\backups" }
$RETENTION_DAYS = if ($env:RETENTION_DAYS) { [int]$env:RETENTION_DAYS } else { 14 }
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"

# Create backup directory if it doesn't exist
New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null

# Check if mysqldump is available
if (-not (Get-Command mysqldump -ErrorAction SilentlyContinue)) {
    Write-Error "Error: mysqldump is not installed or not on PATH."
    Write-Error "Install MySQL Client tools and add to PATH, then retry."
    exit 1
}

# Parse DATABASE_URL if provided
if ($env:DATABASE_URL) {
    $uri = [System.Uri]$env:DATABASE_URL
    $env:MYSQL_HOST = $uri.Host
    $env:MYSQL_PORT = if ($uri.Port -gt 0) { $uri.Port } else { 3306 }
    $env:MYSQL_USER = [System.Web.HttpUtility]::UrlDecode($uri.UserInfo.Split(':')[0])
    $env:MYSQL_PASSWORD = [System.Web.HttpUtility]::UrlDecode($uri.UserInfo.Split(':')[1])
    $env:MYSQL_DATABASE = $uri.AbsolutePath.TrimStart('/')
}

# Validate required environment variables
if (-not $env:MYSQL_HOST) {
    Write-Error "MYSQL_HOST or DATABASE_URL must be set"
    exit 1
}

if (-not $env:MYSQL_USER) {
    Write-Error "MYSQL_USER or DATABASE_URL must be set"
    exit 1
}

if (-not $env:MYSQL_DATABASE) {
    Write-Error "MYSQL_DATABASE or DATABASE_URL must be set"
    exit 1
}

$MYSQL_PORT = if ($env:MYSQL_PORT) { $env:MYSQL_PORT } else { 3306 }

$OUT_FILE = Join-Path $BACKUP_DIR "barangay_bugo_${TIMESTAMP}.sql"
$OUT_FILE_GZ = "${OUT_FILE}.gz"

Write-Host "Creating MySQL backup..."
Write-Host "Host: $env:MYSQL_HOST"
Write-Host "Port: $MYSQL_PORT"
Write-Host "Database: $env:MYSQL_DATABASE"
Write-Host "Output: $OUT_FILE_GZ"

# Set password environment variable for mysqldump
$env:MYSQL_PWD = $env:MYSQL_PASSWORD

# Run mysqldump
mysqldump `
  --host="$env:MYSQL_HOST" `
  --port="$MYSQL_PORT" `
  --user="$env:MYSQL_USER" `
  --single-transaction `
  --routines `
  --triggers `
  --set-gtid-purged=OFF `
  "$env:MYSQL_DATABASE" | Out-File -FilePath $OUT_FILE -Encoding UTF8

# Clear password from environment
$env:MYSQL_PWD = $null

# Compress the backup file (using Windows native compression)
if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
    Compress-Archive -Path $OUT_FILE -DestinationPath "$OUT_FILE.zip" -Force
    Remove-Item $OUT_FILE
    Write-Host "Backup created: $OUT_FILE.zip"
    $OUT_FILE_FINAL = "$OUT_FILE.zip"
} else {
    Write-Host "Backup created (uncompressed): $OUT_FILE"
    $OUT_FILE_FINAL = $OUT_FILE
}

# Prune backups older than RETENTION_DAYS
Write-Host "Running retention cleanup (${RETENTION_DAYS} days)..."
$cutoffDate = (Get-Date).AddDays(-$RETENTION_DAYS)
Get-ChildItem -Path $BACKUP_DIR -Filter "barangay_bugo_*" | 
    Where-Object { $_.LastWriteTime -lt $cutoffDate } | 
    Remove-Item -Force

Write-Host "Retention cleanup completed."
Write-Host "Backup process finished successfully!"
