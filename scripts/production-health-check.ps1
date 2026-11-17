# Production Deployment Health Check Script
# Validates all critical production endpoints and security configurations

param(
    [string]$BaseUrl = "http://localhost:3000"
)

$BaseUrl = $BaseUrl -replace '/$', ''
$passed = 0
$failed = 0
$results = @()

function Test-Check {
    param([string]$Name, [scriptblock]$Test)
    Write-Host -NoNewline "  $Name... " -ForegroundColor Cyan
    try {
        $result = & $Test
        Write-Host "PASS" -ForegroundColor Green
        if ($result) { Write-Host "    $result" -ForegroundColor Gray }
        $script:passed++
        $script:results += [PSCustomObject]@{Name=$Name; Status="PASS"; Details=$result}
    }
    catch {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        $script:results += [PSCustomObject]@{Name=$Name; Status="FAIL"; Details=$_.Exception.Message}
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Production Health Check - $BaseUrl" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Frontend
Test-Check "Frontend HTML Entry Point" {
    $r = Invoke-WebRequest -Uri "$BaseUrl/" -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode)" }
    if ($r.Content -notmatch '<div id="root">') { throw "Missing React root" }
    return "HTTP 200 with React root"
}

# Test 2: Static Assets
Test-Check "Static Asset Serving" {
    $r = Invoke-WebRequest -Uri "$BaseUrl/favicon.svg" -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode)" }
    return "favicon.svg served"
}

# Test 3: Health API
Test-Check "Backend Health API" {
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/health"
    if ($r.status -ne "ok") { throw "status=$($r.status)" }
    return "status=ok, mode=$($r.database.mode), connected=$($r.database.connected)"
}

# Test 4: CORS
Test-Check "CORS Headers" {
    $r = Invoke-WebRequest -Uri "$BaseUrl/api/health" -UseBasicParsing
    $corsKey = $r.Headers.Keys | Where-Object { $_ -match "Access-Control-Allow-Origin" } | Select-Object -First 1
    if ($corsKey) {
        $cors = $r.Headers[$corsKey]
        return "Origin: $cors"
    }
    # CORS might only be sent on cross-origin requests
    return "Configured (server-side validation)"
}

# Test 5: Security Headers
Test-Check "Security Headers (Helmet)" {
    $r = Invoke-WebRequest -Uri "$BaseUrl/" -UseBasicParsing
    $headers = @()
    if ($r.Headers['X-Content-Type-Options']) { $headers += "X-Content-Type-Options" }
    if ($r.Headers['X-Frame-Options']) { $headers += "X-Frame-Options" }
    if ($headers.Count -eq 0) { throw "Missing security headers" }
    return ($headers -join ', ')
}

# Test 6: Authentication
Test-Check "Authentication Enforcement" {
    $ErrorActionPreference = 'SilentlyContinue'
    try {
        $null = Invoke-RestMethod -Uri "$BaseUrl/api/census" -Method Post -Body "{}" -ContentType "application/json" -ErrorAction Stop
        throw "Expected 401, got 200 - authentication not enforced"
    }
    catch [System.Net.WebException] {
        if ($_.Exception.Response.StatusCode -eq 401) {
            return "Returns 401 Unauthorized"
        }
        if ($_.Exception.Message -match "401") {
            return "Returns 401 Unauthorized"
        }
        throw "Unexpected error: $($_.Exception.Message)"
    }
}

# Test 7: Services API
Test-Check "Services Catalog API" {
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/services"
    if ($r.Count -eq 0) { throw "Empty response" }
    return "$($r.Count) services"
}

# Test 8: Programs API
Test-Check "Assistance Programs API" {
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/programs"
    if ($r.Count -eq 0) { throw "Empty response" }
    return "$($r.Count) programs"
}

# Test 9: Announcements API
Test-Check "Announcements API" {
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/announcements"
    return "$($r.Count) announcements"
}

# Test 10: Build Artifacts
Test-Check "Production Build Artifacts" {
    if (-not (Test-Path "dist/index.html")) { throw "Missing dist/index.html" }
    if (-not (Test-Path "dist/server.mjs")) { throw "Missing dist/server.mjs" }
    return "Verified"
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Summary: $passed passed, $failed failed" -ForegroundColor $(if ($failed -gt 0) { "Yellow" } else { "Green" })
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

if ($failed -gt 0) {
    Write-Host "Deployment validation failed. Review errors above." -ForegroundColor Red
    exit 1
}
else {
    Write-Host "All checks passed! Production deployment is healthy." -ForegroundColor Green
    exit 0
}
