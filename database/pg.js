// database/pg.js
// Embedded PostgreSQL — used as the durable store for forgot-password OTPs.
//
// Everything runs in userspace via the `embedded-postgres` npm package
// (real Postgres binaries, no system install or sudo needed):
//
//   * data directory : data/pg              (git-ignored)
//   * port           : 5433 (override with PG_PORT)
//   * database       : krishisetu (override with PG_DATABASE)
//
// Boot is "fail soft": if Postgres cannot start for any reason, the app keeps
// running and forgot-password OTPs fall back to the in-memory store — the
// platform never breaks because of the database layer.
//
// You can also point this at your own running Postgres server with
// DATABASE_URL (e.g. postgres://user:pass@localhost:5432/krishisetu).

const fs = require('fs');
const path = require('path');

let EmbeddedPostgres = null;
try {
  const mod = require('embedded-postgres');
  // ESM/TS build exposes { __esModule, default } — unwrap it for CommonJS.
  EmbeddedPostgres = mod && mod.default ? mod.default : mod;
} catch (err) {
  // package not installed — pure in-memory fallback
}

const { Pool } = require('pg');

const PG_DIR = path.join(__dirname, '..', 'data', 'pg');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

const DATABASE_URL = process.env.DATABASE_URL || '';
const PORT = Number(process.env.PG_PORT || 5433);
const USER = process.env.PG_USER || 'krishisetu';
const PASSWORD = process.env.PG_PASS || 'krishisetu';
const DATABASE = process.env.PG_DATABASE || 'krishisetu';

let cluster = null;
let pool = null;
let state = 'down'; // down | starting | up | error
let error = null;

/* ------------------------------ status ------------------------------ */

function status() {
  return {
    engine: 'PostgreSQL',
    state: pool ? 'up' : state,
    host: '127.0.0.1',
    port: PORT,
    database: DATABASE,
    detail: error ? `last error: ${error}` : pool ? 'connected' : 'offline (in-memory OTP fallback active)',
    rows: pool ? 0 : 0, // filled by countOtps() when queried elsewhere
  };
}

/* ------------------------------ helpers ----------------------------- */

function isExternal() {
  return !!DATABASE_URL;
}

function sqlFile() {
  return fs.existsSync(SCHEMA_FILE) ? fs.readFileSync(SCHEMA_FILE, 'utf8') : '';
}

/* ------------------------------- boot ------------------------------- */

async function start() {
  if (pool) return true; // already up

  try {
    // 1) If an external Postgres is configured, connect to it directly.
    if (isExternal()) {
      pool = new Pool({ connectionString: DATABASE_URL, max: 5 });
      await pool.query('SELECT 1');
      await applySchema(pool);
      pool.on('error', () => {});
      state = 'up';
      return true;
    }

    if (!EmbeddedPostgres) {
      state = 'error';
      error = 'embedded-postgres not installed (npm i embedded-postgres)';
      return false;
    }

    // 2) Already running from a previous boot? Just reuse it.
    if (await probe(USER, PASSWORD, PORT, DATABASE)) {
      pool = makePool();
      pool.on('error', () => {});
      state = 'up';
      return true;
    }

    state = 'starting';

    // 3) Initialise the cluster once (initdb).
    cluster = new EmbeddedPostgres({
      databaseDir: PG_DIR,
      port: PORT,
      user: USER,
      password: PASSWORD,
      authMethod: 'password',
      persistent: true,
    });

    if (!fs.existsSync(path.join(PG_DIR, 'PG_VERSION'))) {
      await cluster.initialise();
    }

    await cluster.start();

    // 4) Create the application database if missing.
    await ensureDatabase();

    // 5) Apply the schema.
    pool = makePool();
    await applySchema(pool);
    pool.on('error', () => {});

    state = 'up';
    console.log(`🐘 PostgreSQL (OTP store) ready on 127.0.0.1:${PORT}/${DATABASE}`);
    return true;
  } catch (err) {
    state = 'error';
    error = err.message || String(err);
    if (pool) {
      try { await pool.end(); } catch (e) {}
      pool = null;
    }
    console.error('⚠️  PostgreSQL (OTP store) not available — using in-memory OTP fallback:', error);
    return false;
  }
}

async function stop() {
  if (pool) {
    try { await pool.end(); } catch (e) {}
    pool = null;
  }
  if (cluster) {
    try { await cluster.stop(); } catch (e) {}
  }
  state = 'down';
}

/* --------------------------- low-level API -------------------------- */

function makePool() {
  return new Pool({
    host: '127.0.0.1',
    port: PORT,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
    max: 5,
    connectionTimeoutMillis: 3000,
  });
}

// Quick connectivity probe (used to reuse a running cluster across restarts).
async function probe(user, pass, port, database) {
  const { Client } = require('pg');
  const client = new Client({
    host: '127.0.0.1',
    port,
    user,
    password: pass,
    database,
    connectionTimeoutMillis: 1500,
  });
  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return true;
  } catch (e) {
    try { await client.end(); } catch (e2) {}
    return false;
  }
}

async function ensureDatabase() {
  const admin = cluster.getPgClient('postgres');
  await admin.connect();
  try {
    const res = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [DATABASE]);
    if (res.rowCount === 0) {
      await admin.query(`CREATE DATABASE ${admin.escapeIdentifier(DATABASE)}`);
    }
  } finally {
    await admin.end();
  }
}

async function applySchema(client) {
  const schema = sqlFile();
  if (!schema) return;
  await client.query(schema);
}

// ---- OTP row helpers (used by utils/otp.js) — return booleans on
// success, and throw/reject when Postgres is unavailable so the caller can
// fall back to the in-memory store.

async function createOtp(userId, { otp, email, expiresAt, attempts }) {
  const p = pool || (await start() && pool);
  if (!p) throw new Error('postgres unavailable');
  await p.query('BEGIN');
  try {
    await p.query('DELETE FROM password_reset_otps WHERE user_id = $1', [userId]);
    await p.query(
      `INSERT INTO password_reset_otps (user_id, email, otp, expires_at, attempts)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, email, otp, expiresAt, attempts || 0]
    );
    await p.query('COMMIT');
    return true;
  } catch (err) {
    await p.query('ROLLBACK');
    throw err;
  }
}

async function findOtp(userId) {
  const p = pool || (await start() && pool);
  if (!p) throw new Error('postgres unavailable');
  const res = await p.query(
    `SELECT * FROM password_reset_otps
     WHERE user_id = $1
     ORDER BY id DESC
     LIMIT 1`,
    [userId]
  );
  return res.rowCount ? res.rows[0] : null;
}

async function addOtpAttempt(userId, attempts) {
  const p = pool || (await start() && pool);
  if (!p) throw new Error('postgres unavailable');
  await p.query('UPDATE password_reset_otps SET attempts = $2 WHERE user_id = $1', [userId, attempts]);
  return true;
}

async function markOtpUsed(userId) {
  const p = pool || (await start() && pool);
  if (!p) throw new Error('postgres unavailable');
  await p.query('UPDATE password_reset_otps SET used = TRUE WHERE user_id = $1', [userId]);
  return true;
}

async function deleteOtp(userId) {
  const p = pool || (await start() && pool);
  if (!p) throw new Error('postgres unavailable');
  await p.query('DELETE FROM password_reset_otps WHERE user_id = $1', [userId]);
  return true;
}

async function countOtps() {
  if (!pool) return 0;
  try {
    const res = await pool.query('SELECT COUNT(*)::int AS n FROM password_reset_otps');
    return res.rows[0].n;
  } catch (e) {
    return 0;
  }
}

module.exports = {
  start,
  stop,
  status,
  countOtps,
  createOtp,
  findOtp,
  addOtpAttempt,
  markOtpUsed,
  deleteOtp,
};