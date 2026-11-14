const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');

// Test password hashing and rate limiting logic
test('Authentication: bcrypt password hashing and verification', async () => {
  const plainPassword = 'AdminSecurePassword2026!';
  const hash = await bcrypt.hash(plainPassword, 10);

  assert.strictEqual(typeof hash, 'string');
  assert.ok(hash.startsWith('$2'));

  const valid = await bcrypt.compare(plainPassword, hash);
  assert.strictEqual(valid, true);

  const invalid = await bcrypt.compare('WrongPassword', hash);
  assert.strictEqual(invalid, false);
});

test('Rate limiting logic correctly throttles excessive requests', () => {
  const rateLimitMap = new Map();

  function testLimiter(key, limit, windowMs) {
    const now = Date.now();
    const record = rateLimitMap.get(key);
    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }
    if (record.count >= limit) {
      return { allowed: false, remaining: 0 };
    }
    record.count += 1;
    return { allowed: true, remaining: limit - record.count };
  }

  const key = 'test-ip-127.0.0.1';
  for (let i = 0; i < 5; i++) {
    const res = testLimiter(key, 5, 10000);
    assert.strictEqual(res.allowed, true);
  }

  // 6th attempt must be rejected
  const blocked = testLimiter(key, 5, 10000);
  assert.strictEqual(blocked.allowed, false);
});
