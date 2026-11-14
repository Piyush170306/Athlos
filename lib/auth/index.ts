import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { AdminUser } from '@/lib/types';

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET must be configured before using admin sessions.');
  }
  return secret;
}
const ALLOWED_EMAILS = (process.env.ADMIN_ALLOWED_EMAILS || 'admin@athlos.edu,sports@athlos.edu')
  .split(',')
  .map((e) => e.trim().toLowerCase());

// In-memory rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count };
}

export function isEmailAuthorized(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}

export async function authenticateAdmin(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (!isEmailAuthorized(normalizedEmail)) {
    return { success: false, error: 'Unauthorized email domain or administrator account.' };
  }

  const user = db.query('admin_users', (u) => u.email.toLowerCase() === normalizedEmail)[0];
  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return { success: false, error: 'Invalid email or password.' };
  }

  return { success: true, user };
}

export function createAdminSessionToken(user: AdminUser): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, getSessionSecret(), { expiresIn: '8h' });
}

export function verifyAdminSessionToken(token: string): { valid: boolean; user?: { userId: string; email: string; role: string } } {
  try {
    const decoded = jwt.verify(token, getSessionSecret()) as { userId: string; email: string; role: string };
    return { valid: true, user: decoded };
  } catch (err) {
    return { valid: false };
  }
}

export function createPasswordResetToken(email: string): { success: boolean; token?: string; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.query('admin_users', (u) => u.email.toLowerCase() === normalizedEmail)[0];

  if (!user) {
    // Return true without token to avoid email enumeration
    return { success: true };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  db.update('admin_users', user.id, {
    resetToken,
    resetTokenExpiresAt: expiresAt,
  });

  db.logAudit(user.email, 'PASSWORD_RESET_REQUESTED', 'ADMIN_USER', user.id);

  return { success: true, token: resetToken };
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  const now = new Date().toISOString();
  const user = db.query(
    'admin_users',
    (u) => u.resetToken === token && !!u.resetTokenExpiresAt && u.resetTokenExpiresAt > now
  )[0];

  if (!user) {
    return { success: false, error: 'Invalid or expired password reset link.' };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  db.update('admin_users', user.id, {
    passwordHash,
    resetToken: undefined,
    resetTokenExpiresAt: undefined,
  });

  db.logAudit(user.email, 'PASSWORD_RESET_COMPLETED', 'ADMIN_USER', user.id);

  return { success: true };
}
