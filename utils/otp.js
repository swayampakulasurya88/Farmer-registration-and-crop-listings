// utils/otp.js
// In-memory one-time-password store for the "forgot password" flow.
// OTPs expire after OTP_TTL_MS and are locked after 5 wrong attempts.

const crypto = require('crypto');

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

// userId -> { otp, email, expiresAt, attempts }
const pending = new Map();

// Creates a fresh 6-digit OTP for a user.
function generate(userId, email) {
  const otp = String(crypto.randomInt(100000, 1000000)); // 100000..999999
  pending.set(userId, {
    otp,
    email,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return otp;
}

// Returns the pending record (or null when missing/expired).
function get(userId) {
  const record = pending.get(userId);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    pending.delete(userId);
    return null;
  }
  return record;
}

// Verifies an OTP. On success the record is consumed (one-time use).
function verify(userId, input) {
  const record = get(userId);
  if (!record) return { ok: false, reason: 'expired', attemptsLeft: 0 };

  record.attempts += 1;
  if (record.attempts > MAX_ATTEMPTS) {
    pending.delete(userId);
    return { ok: false, reason: 'locked', attemptsLeft: 0 };
  }

  if (String(input || '').trim() !== record.otp) {
    return {
      ok: false,
      reason: 'invalid',
      attemptsLeft: MAX_ATTEMPTS - record.attempts,
    };
  }

  pending.delete(userId);
  return { ok: true, reason: 'ok', attemptsLeft: 0 };
}

module.exports = { generate, get, verify, OTP_TTL_MS };