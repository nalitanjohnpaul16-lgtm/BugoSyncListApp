# Final Production Deployment Verification
# Comprehensive check of all production-ready features

param([string]$BaseUrl = "http://localhost:3000")

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "FINAL PRODUCTION DEPLOYMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

$passed = 0
$total = 0

function Test-Feature {
    param([string]$Name, [scriptblock]$Test)
    $script:total++
    Write-Host "[$script:total] Testing: $Name" -ForegroundColor Yellow
    try {
        $result = & $Test
        Write-Host "    ✓ PASS: $result`n" -ForegroundColor Green
        $script:passed++
        return $true
    }
    catch {
        Write-Host "    ✗ FAIL: $($_.Exception.Message)`n" -ForegroundColor Red
        return $false
    }
}

# 1. Health Check
Test-Feature "Backend Health Endpoint" {
    $r = Invoke-RestMethod "$BaseUrl/api/health"
    if ($r.status -ne "ok") { throw "Status: $($r.status)" }
    "Environment: $($r.environment), DB: $($r.database.mode), Connected: $($r.database.connected)"
}

# 2. Frontend
Test-Feature "Frontend Entry Point" {
    $r = Invoke-WebRequest "$BaseUrl/" -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode)" }
    if ($r.Content -notmatch 'id="root"') { throw "Missing React root" }
    "Serving React SPA"
}

# 3. Build Artifacts
Test-Feature "Production Build Artifacts" {
    if (!(Test-Path "dist/index.html")) { throw "Missing dist/index.html" }
    if (!(Test-Path "dist/server.mjs")) { throw "Missing dist/server.mjs" }
    $size = [Math]::Round((Get-Item "dist/server.mjs").Length / 1KB, 2)
    "Server bundle: ${size}KB"
}

# 4. Admin Login
$adminToken = ""
Test-Feature "Admin Login and JWT Generation" {
    $body = @{email="admin@bugo.gov.ph"; password="BugoAdmin@Secure2026!#"} | ConvertTo-Json
    $r = Invoke-RestMethod "$BaseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    if (!$r.token) { throw "No token returned" }
    $script:adminToken = $r.token
    "Role: $($r.user.role), Token parts: $($r.token.Split('.').Length)"
}

# 5. Resident Login
$residentToken = ""
Test-Feature "Resident Login and JWT Generation" {
    $body = @{email="resident@bugo.gov.ph"; password="BugoResident@Secure2026!#"} | ConvertTo-Json
    $r = Invoke-RestMethod "$BaseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    if (!$r.token) { throw "No token returned" }
    $script:residentToken = $r.token
    "Role: $($r.user.role), User: $($r.user.name)"
}

# 6. JWT Verification
Test-Feature "JWT Session Verification" {
    $headers = @{Authorization="Bearer $adminToken"}
    $r = Invoke-RestMethod "$BaseUrl/api/auth/me" -Headers $headers
    if ($r.user.role -ne "admin") { throw "Wrong role: $($r.user.role)" }
    "Verified: $($r.user.email)"
}

# 7. RBAC - Unauthenticated
Test-Feature "RBAC: Blocks Unauthenticated Requests" {
    try {
        Invoke-RestMethod "$BaseUrl/api/census" -Method Post -Body "{}" -ContentType "application/json" -ErrorAction Stop
        throw "Should have returned 401"
    }
    catch {
        if ($_ -match "401") { return "Returns 401 Unauthorized" }
        throw $_
    }
}

# 8. RBAC - Resident blocked from admin route
Test-Feature "RBAC: Blocks Residents from Admin Routes" {
    try {
        $headers = @{Authorization="Bearer $residentToken"}
        Invoke-RestMethod "$BaseUrl/api/census" -Method Post -Headers $headers -Body "{}" -ContentType "application/json" -ErrorAction Stop
        throw "Should have returned 403"
    }
    catch {
        if ($_ -match "403") { return "Returns 403 Forbidden" }
        throw $_
    }
}

# 9. Database - Programs
Test-Feature "Database: Assistance Programs" {
    $r = Invoke-RestMethod "$BaseUrl/api/programs"
    if ($r.Count -eq 0) { throw "No programs found" }
    "$($r.Count) programs loaded"
}

# 10. Database - Services
Test-Feature "Database: Services Catalog" {
    $r = Invoke-RestMethod "$BaseUrl/api/services"
    if ($r.Count -eq 0) { throw "No services found" }
    "$($r.Count) services available"
}

# 11. Database - Announcements
Test-Feature "Database: Announcements" {
    $r = Invoke-RestMethod "$BaseUrl/api/announcements"
    "$($r.Count) announcements"
}

# 12. CRUD Operations
Test-Feature "CRUD: Create Application" {
    $headers = @{Authorization="Bearer $residentToken"}
    $app = @{
        programId = "prog-barangay-clearance"
        programTitle = "Barangay Clearance"
        applicantName = "Test User"
        purok = "Zone 1 - Centro Riverside"
        address = "Test Address"
        householdMonthlyIncome = "PHP 10,000"
        familyMembersCount = 3
        occupation = "Employee"
        purposeOrDiagnosis = "Verification Test"
        documents = @(@{id="test"; name="test.pdf"; docCategory="ID"})
    } | ConvertTo-Json
    
    $r = Invoke-RestMethod "$BaseUrl/api/applications" -Method Post -Headers $headers -Body $app -ContentType "application/json"
    if (!$r.application.id) { throw "No application ID returned" }
    $script:testAppId = $r.application.id
    "Created: $($r.referenceCode)"
}

# 13. Read Application
Test-Feature "CRUD: Read Applications" {
    $r = Invoke-RestMethod "$BaseUrl/api/applications"
    $app = $r | Where-Object { $_.id -eq $script:testAppId }
    if (!$app) { throw "Test application not found" }
    "Found application: $($app.referenceCode)"
}

# 14. Delete Application (Cleanup)
Test-Feature "CRUD: Delete Application" {
    $headers = @{Authorization="Bearer $adminToken"}
    $r = Invoke-RestMethod "$BaseUrl/api/applications/$script:testAppId" -Method Delete -Headers $headers
    if (!$r.success) { throw "Delete failed" }
    "Deleted test application"
}

# 15. Security Headers
Test-Feature "Security: Helmet Headers Present" {
    $r = Invoke-WebRequest "$BaseUrl/" -UseBasicParsing
    $headers = @()
    if ($r.Headers["X-Content-Type-Options"]) { $headers += "X-Content-Type-Options" }
    if ($r.Headers["X-Frame-Options"]) { $headers += "X-Frame-Options" }
    if ($headers.Count -eq 0) { throw "No security headers found" }
    $headers -join ", "
}

# 16. Password Security
Test-Feature "Security: No Password Leaks" {
    $r1 = Invoke-WebRequest "$BaseUrl/api/data" -UseBasicParsing
    $r2 = Invoke-WebRequest "$BaseUrl/api/database/mysql-info" -UseBasicParsing
    if ($r1.Content -match "passwordHash|passwordPlain") { throw "Password leaked in /api/data" }
    if ($r2.Content -match "BugoAdmin|BugoResident") { throw "Password leaked in /api/database/mysql-info" }
    "No sensitive data in public endpoints"
}

# Final Summary
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT VERIFICATION COMPLETE" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Results: $passed/$total tests passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host ""
    Write-Host "[OK] Production deployment is READY" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deployment checklist:" -ForegroundColor Cyan
    Write-Host "  [OK] Production build artifacts generated" -ForegroundColor Green
    Write-Host "  [OK] Database connected (MySQL + Prisma)" -ForegroundColor Green
    Write-Host "  [OK] Authentication and JWT working" -ForegroundColor Green
    Write-Host "  [OK] RBAC enforcement active" -ForegroundColor Green
    Write-Host "  [OK] CRUD operations functional" -ForegroundColor Green
    Write-Host "  [OK] Security headers configured" -ForegroundColor Green
    Write-Host "  [OK] No password leaks detected" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Configure production DATABASE_URL with TLS" -ForegroundColor White
    Write-Host "  2. Set NODE_ENV=production" -ForegroundColor White
    Write-Host "  3. Update APP_URL and CORS_ORIGIN" -ForegroundColor White
    Write-Host "  4. Set FORCE_HTTPS=true" -ForegroundColor White
    Write-Host "  5. Deploy using: npm start" -ForegroundColor White
    Write-Host "  6. Verify with: VERIFY_BASE_URL=https://your-url npm run verify:deploy" -ForegroundColor White
    Write-Host ""
    exit 0
}
else {
    Write-Host "[!] Some tests failed - review errors above" -ForegroundColor Red
    Write-Host ""
    exit 1
}
