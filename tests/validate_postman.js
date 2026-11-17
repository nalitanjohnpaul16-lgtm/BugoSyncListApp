/**
 * Postman API Collection Validator
 * Tests all endpoints from Barangay_Bugo_API.postman_collection.json
 */

const BASE_URL = 'http://localhost:3000';

async function test(name, testFn) {
  try {
    await testFn();
    console.log(`✔ PASS: ${name}`);
    return true;
  } catch (err) {
    console.error(`✖ FAIL: ${name} - ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('\n================================================================');
  console.log('POSTMAN API COLLECTION VALIDATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  if (await test('1. System Health Check', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(`Expected status=ok, got ${data.status}`);
  })) passed++; else failed++;

  // Test 2: Admin Authentication
  if (await test('2. Admin Authentication (Valid Credentials)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bugo.gov.ph', password: 'BugoAdmin@Secure2026!#' })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Login failed');
    if (data.user.role !== 'admin') throw new Error(`Expected role=admin, got ${data.user.role}`);
  })) passed++; else failed++;

  // Test 3: Resident Authentication
  if (await test('3. Resident Authentication (Valid Credentials)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'resident@bugo.gov.ph', password: 'BugoResident@Secure2026!#' })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Login failed');
    if (data.user.role !== 'resident') throw new Error(`Expected role=resident, got ${data.user.role}`);
  })) passed++; else failed++;

  // Test 4: Invalid Password Rejection
  if (await test('4. Security Check - Reject Invalid Password', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bugo.gov.ph', password: 'IncorrectPassword123' })
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error('Should return success=false');
  })) passed++; else failed++;

  // Test 5: Data Sanitization & 44 Services
  if (await test('5. Data Sanitization & 44 Services Verification', async () => {
    const res = await fetch(`${BASE_URL}/api/data`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.programs.length !== 44) throw new Error(`Expected 44 services, got ${data.programs.length}`);
    
    // Check password hash sanitization
    for (const user of data.users) {
      if (user.passwordHash) throw new Error('Password hash leaked in public data');
    }
  })) passed++; else failed++;

  // Test 6: MySQL Schema Export
  if (await test('6. MySQL Schema & DDL Export Verification', async () => {
    const res = await fetch(`${BASE_URL}/api/database/export-sql`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const text = await res.text();
    if (!text.includes('barangay_bugo_db')) throw new Error('Missing barangay_bugo_db in SQL dump');
    if (!text.includes('ENGINE=InnoDB')) throw new Error('Missing InnoDB engine');
  })) passed++; else failed++;

  // Test 7: MySQL Diagnostic Metadata
  if (await test('7. MySQL Diagnostic Metadata', async () => {
    const res = await fetch(`${BASE_URL}/api/database/mysql-info`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.tables.length !== 8) throw new Error(`Expected 8 tables, got ${data.tables.length}`);
    if (data.characterSet !== 'utf8mb4') throw new Error(`Expected utf8mb4, got ${data.characterSet}`);
  })) passed++; else failed++;

  // Test 8: Database Schema & ERD
  if (await test('8. Database Schema & ERD Inspection', async () => {
    const res = await fetch(`${BASE_URL}/api/database/schema`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.totalTables !== 8) throw new Error(`Expected 8 tables, got ${data.totalTables}`);
    if (!data.relations || data.relations.length === 0) throw new Error('No relations found');
  })) passed++; else failed++;

  // Test 9: Deployment Readiness Status
  if (await test('9. Deployment Readiness Status', async () => {
    const res = await fetch(`${BASE_URL}/api/deployment/status`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.readinessChecks || data.readinessChecks.length <= 5) {
      throw new Error(`Expected > 5 readiness checks, got ${data.readinessChecks?.length || 0}`);
    }
  })) passed++; else failed++;

  console.log('\n================================================================');
  console.log(`POSTMAN VALIDATION RESULTS: ${passed}/${passed + failed} tests passed`);
  if (failed > 0) {
    console.log(`⚠ ${failed} test(s) failed`);
    process.exit(1);
  } else {
    console.log('✓ All Postman collection tests passed successfully');
  }
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
