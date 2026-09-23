// utils/otp.js
// One-time-password store for the "forgot password" flow.
//
// Storage backend:
//   * PRIMARY   — embedded PostgreSQL (table password_reset_otps).
//                 Persisted across restarts; survives the process.
//   * FALLBACK  — in-memory Map, used automatically whenever Postgres is
//                 unavailable, so the flow never breaks.
//
// Rules: 6-digit OTP, 10-minute expiry, one-time use, max 5 wrong attempts.

const crypto = require('crypto');

const PG = require('../database/pg');

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

// In-memory fallback: userId -> { otp, email, expiresAt(ms), attempts }
const memory = new Map();

/* ------------------------------ generate ---------------------------- */

async function generate(userId, email) {
  const otp = String(crypto.randomInt(100000, 1000000)); // 100000..999999
  const expiresAtMs = Date.now() + OTP_TTL_MS;
  const record = { otp, email, expiresAt: new Date(expiresAtMs), attempts: 0 };

  // Postgres first; if it fails, the in-memory copy below is the source.
  try {
    await PG.createOtp(userId, record);
  } catch (err) {
    // fall back to memory
    memory.set(userId, { ...record, expiresAt: expiresAtMs });
  }

  return otp;
}

/* -------------------------------- get ------------------------------- */

// Returns the pending record (or null when missing/expired/used).
async function get(userId) {
  // Try PostgreSQL (source of truth when available).
  try {
    const row = await PG.findOtp(userId);
    if (!row) return null;
    if (row.used) return null;
    if (Date.now() > new Date(row.expires_at).getTime()) {
      try { await PG.deleteOtp(userId); } catch (e) {}
      return null;
    }
    return {
      otp: row.otp,
      email: row.email,
      expiresAt: new Date(row.expires_at).getTime(),
      attempts: Number(row.attempts),
      source: 'postgres',
    };
  } catch (err) {
    // Postgres unavailable → in-memory fallback
  }

  const rec = memory.get(userId);
  if (!rec) return null;
  if (Date.now() > rec.expiresAt) {
    memory.delete(userId);
    return null;
  }
  return { ...rec, source: 'memory' };
}

/* ------------------------------ verify ------------------------------ */

// Verifies an OTP. On success the record is consumed (one-time use).
async function verify(userId, input) {
  const record = await get(userId);
  if (!record) return { ok: false, reason: 'expired', attemptsLeft: 0 };

  const attempts = record.attempts + 1;

  if (attempts > MAX_ATTEMPTS) {
    await remove(userId);
    return { ok: false, reason: 'locked', attemptsLeft: 0 };
  }

  const matches = String(input || '').trim() === record.otp;

  if (!matches) {
    if (record.source === 'postgres') {
      try { await PG.addOtpAttempt(userId, attempts); } catch (e) {}
    } else {
      memory.set(userId, { ...record, attempts });
    }
    return { ok: false, reason: 'invalid', attemptsLeft: MAX_ATTEMPTS - attempts };
  }

  // Success — consume (one-time use).
  if (record.source === 'postgres') {
    try { await PG.markOtpUsed(userId); } catch (e) {}
  }
  memory.delete(userId);
  return { ok: true, reason: 'ok', attemptsLeft: 0 };
}

/* ------------------------------ helpers ----------------------------- */

async function remove(userId) {
  try { await PG.deleteOtp(userId); } catch (e) {}
  memory.delete(userId);
}

async function count() {
  return (await PG.countOtps().catch(() => 0)) + memory.size;
}

module.exports = { generate, get, verify, remove, count, OTP_TTL_MS };