/**
 * Phase 0 Security Verification Specification Tests for firestore.rules
 * Verifies Dirty Dozen payloads against Identity, Integrity, PII, and State invariants.
 */

export const DIRTY_DOZEN_PAYLOADS = [
  { name: 'Unauthenticated token create', auth: null, path: '/fcm_tokens/tok_1', op: 'create', expected: 'PERMISSION_DENIED' },
  { name: 'Unverified email token create', auth: { uid: 'u1', email_verified: false }, path: '/fcm_tokens/tok_1', op: 'create', expected: 'PERMISSION_DENIED' },
  { name: 'Spoofed uid on create', auth: { uid: 'u1', email_verified: true }, data: { uid: 'u2' }, path: '/fcm_tokens/tok_1', op: 'create', expected: 'PERMISSION_DENIED' },
  { name: 'Shadow ghost field injection', auth: { uid: 'u1', email_verified: true }, data: { uid: 'u1', isAdmin: true }, path: '/fcm_tokens/tok_1', op: 'create', expected: 'PERMISSION_DENIED' },
  { name: 'Oversized document ID poisoning', auth: { uid: 'u1', email_verified: true }, path: `/fcm_tokens/${'a'.repeat(200)}`, op: 'create', expected: 'PERMISSION_DENIED' },
  { name: 'Invalid phone pattern', auth: { uid: 'u1', email_verified: true }, data: { contactNumber: 'invalid-phone' }, path: '/fcm_tokens/tok_1', op: 'create', expected: 'PERMISSION_DENIED' },
  { name: 'Client forged createdAt timestamp', auth: { uid: 'u1', email_verified: true }, data: { createdAt: '2020-01-01T00:00:00Z' }, path: '/fcm_tokens/tok_1', op: 'create', expected: 'PERMISSION_DENIED' },
  { name: 'Immutable uid/createdAt update attempt', auth: { uid: 'u1', email_verified: true }, data: { uid: 'u2' }, path: '/fcm_tokens/tok_1', op: 'update', expected: 'PERMISSION_DENIED' },
  { name: 'Cross-user PII token read attempt', auth: { uid: 'u2', email_verified: true }, path: '/fcm_tokens/tok_1', op: 'get', expected: 'PERMISSION_DENIED' },
  { name: 'Non-admin dispatch create attempt', auth: { uid: 'u1', email_verified: true }, path: '/fcm_dispatches/d_1', op: 'create', expected: 'PERMISSION_DENIED' },
  { name: 'Non-admin terminal status tamper', auth: { uid: 'u1', email_verified: true }, data: { status: 'Queued' }, path: '/fcm_dispatches/d_1', op: 'update', expected: 'PERMISSION_DENIED' },
  { name: 'Self-grant admin role escalation', auth: { uid: 'u1', email_verified: true }, path: '/admins/u1', op: 'create', expected: 'PERMISSION_DENIED' },
];
