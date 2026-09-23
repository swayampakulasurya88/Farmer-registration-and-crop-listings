// data/db.js
// SQLite-backed data layer (via sql.js — a pure JS/WASM build of SQLite,
// so no native compilation is needed).
//
//   * The whole database lives in a single file: data/krishisetu.sqlite
//   * Every write is persisted to disk immediately (synchronous)
//   * On first run, existing data is imported from the legacy JSON store
//     (data/store.json) so nothing is lost
//   * Set DATA_DIR to place the SQLite file somewhere else (mount a volume
//     there on a server so data survives restarts, e.g. in Docker)
//
// The API below is identical to the old JSON-file store, so routes were
// not touched.

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

// DATA_DIR defaults to this folder (data/) — exactly the local behaviour.
// On a deployed server, point it at a mounted volume (e.g. DATA_DIR=/app/data).
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_FILE = path.join(DATA_DIR, 'krishisetu.sqlite');
const LEGACY_FILE = path.join(DATA_DIR, 'store.json');
const WASM_FILE = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT,
  username     TEXT,
  passwordHash TEXT,
  role         TEXT NOT NULL,
  village      TEXT,
  phone        TEXT,
  address      TEXT,
  landSize     TEXT,
  businessType TEXT,
  active       INTEGER NOT NULL DEFAULT 1,
  createdAt    TEXT NOT NULL,
  updatedAt    TEXT
);
CREATE TABLE IF NOT EXISTS listings (
  id            TEXT PRIMARY KEY,
  farmerId      TEXT NOT NULL,
  farmerName    TEXT NOT NULL,
  crop          TEXT NOT NULL,
  variety       TEXT,
  quantity      REAL NOT NULL DEFAULT 0,
  unit          TEXT NOT NULL,
  price         REAL NOT NULL DEFAULT 0,
  priceUnit     TEXT NOT NULL,
  quality       TEXT,
  location      TEXT,
  district      TEXT,
  harvestDate   TEXT,
  availableDate TEXT,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  createdAt     TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS interests (
  id        TEXT PRIMARY KEY,
  listingId TEXT NOT NULL,
  buyerId   TEXT NOT NULL,
  message   TEXT,
  createdAt TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS favorites (
  id        TEXT PRIMARY KEY,
  buyerId   TEXT NOT NULL,
  listingId TEXT NOT NULL,
  createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_listings_farmer   ON listings(farmerId);
CREATE INDEX IF NOT EXISTS idx_listings_crop     ON listings(crop);
CREATE INDEX IF NOT EXISTS idx_interests_listing ON interests(listingId);
CREATE INDEX IF NOT EXISTS idx_favorites_buyer   ON favorites(buyerId);
`;

let db = null;      // SQL.Database instance
let ready = false;  // set to true after init()
let dirty = false;  // pending changes not yet written to disk

/* ------------------------------------------------------------------ */
/* Initialisation                                                      */
/* ------------------------------------------------------------------ */

async function init() {
  if (ready) return;
  const SQL = await initSqlJs({ locateFile: (file) => path.join(WASM_FILE, file) });

  if (fs.existsSync(DB_FILE)) {
    db = new SQL.Database(new Uint8Array(fs.readFileSync(DB_FILE)));
  } else {
    db = new SQL.Database();
  }

  db.run(SCHEMA);

  // Lightweight migration: older database files predate the editable
  // `address` column, so add it if it is missing.
  const userCols =
    (db.exec('PRAGMA table_info(users)')[0] || { values: [] }).values.map((r) => r[1]);
  if (!userCols.includes('address')) {
    db.run('ALTER TABLE users ADD COLUMN address TEXT');
    dirty = true;
  }

  ready = true;           // database is usable from here on
  migrateFromJson();
  console.log('🗄️  SQLite ready —', shortStats());
}

function assertReady() {
  if (!ready || !db) throw new Error('Database is not initialised yet (call db.init() first).');
}

/* ------------------------------------------------------------------ */
/* Low-level helpers                                                   */
/* ------------------------------------------------------------------ */

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function run(sql, params = []) {
  assertReady();
  db.run(sql, params);
  dirty = true;
  persist();
}

function all(sql, params = []) {
  assertReady();
  const stmt = db.prepare(sql);
  const rows = [];
  try {
    stmt.bind(params);
    while (stmt.step()) rows.push(stmt.getAsObject());
  } finally {
    stmt.free();
  }
  return rows;
}

function get(sql, params = []) {
  return all(sql, params)[0] || null;
}

function count(sql, params = []) {
  const row = get(`SELECT COUNT(*) AS n FROM (${sql})`, params);
  return row ? Number(row.n) : 0;
}

// Flushes the in-memory SQLite database to disk.
function persist() {
  if (!dirty) return;
  fs.writeFileSync(DB_FILE, Buffer.from(db.export()));
  dirty = false;
}

/* ------------------------ row mapping helpers ----------------------- */

function shapeUser(row) {
  if (!row) return null;
  return { ...row, active: Number(row.active) === 1 };
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

function getUsers() {
  return all('SELECT * FROM users ORDER BY createdAt').map(shapeUser);
}

function findUserById(id) {
  return shapeUser(get('SELECT * FROM users WHERE id = ?', [id]));
}

function findUserByEmail(email) {
  const needle = String(email || '').trim().toLowerCase();
  return shapeUser(get('SELECT * FROM users WHERE LOWER(email) = ?', [needle]));
}

// Login accepts either an email address or a username (case-insensitive).
function findUserByLogin(login) {
  const needle = String(login || '').trim().toLowerCase();
  return shapeUser(
    get(
      'SELECT * FROM users WHERE LOWER(email) = ? OR (username IS NOT NULL AND LOWER(username) = ?)',
      [needle, needle]
    )
  );
}

// Entry by mobile number — this is how farmers & buyers "log in"
// (name + mobile + address, no password).
function findUserByMobile(phone) {
  const needle = String(phone || '').trim();
  return shapeUser(get('SELECT * FROM users WHERE phone = ?', [needle]));
}

function addUser(user) {
  user.id = genId('u');
  user.active = true;
  user.createdAt = new Date().toISOString();
  user.updatedAt = user.createdAt;
  run(
    `INSERT INTO users (id, name, email, username, passwordHash, role, village, phone,
                        address, landSize, businessType, active, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.id, user.name, user.email || null, user.username || null, user.passwordHash || null,
     user.role, user.village || null, user.phone || null, user.address || null,
     user.landSize || null, user.businessType || null,
     user.active ? 1 : 0, user.createdAt, user.updatedAt]
  );
  return user;
}

function updateUser(id, patch) {
  const existing = findUserById(id);
  if (!existing) return null;
  const fields = Object.keys(patch);
  if (!fields.length) return existing;

  const sets = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) =>
    f === 'active' ? (patch[f] ? 1 : 0) : patch[f]
  );
  run(`UPDATE users SET ${sets}, updatedAt = ? WHERE id = ?`,
    [...values, new Date().toISOString(), id]);

  return findUserById(id);
}

function countUsersByRole(role) {
  return count('SELECT 1 FROM users WHERE role = ?', [role]);
}

/* ------------------------------------------------------------------ */
/* Listings                                                            */
/* ------------------------------------------------------------------ */

function getListings() {
  return all('SELECT * FROM listings ORDER BY createdAt');
}

function findListingById(id) {
  return get('SELECT * FROM listings WHERE id = ?', [id]);
}

function addListing(listing) {
  listing.id = genId('l');
  listing.status = 'active';
  listing.createdAt = new Date().toISOString();
  // farmerName is denormalised for display speed — derive it if the caller
  // didn't pass it (e.g. route forgot to include the owner's name).
  if (!listing.farmerName) {
    const owner = listing.farmerId ? get('SELECT name FROM users WHERE id = ?', [listing.farmerId]) : null;
    listing.farmerName = owner ? owner.name : 'Farmer';
  }
  run(
    `INSERT INTO listings (id, farmerId, farmerName, crop, variety, quantity, unit,
                           price, priceUnit, quality, location, district,
                           harvestDate, availableDate, notes, status, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [listing.id, listing.farmerId, listing.farmerName, listing.crop, listing.variety || null,
     listing.quantity, listing.unit, listing.price, listing.priceUnit, listing.quality || null,
     listing.location || null, listing.district || null, listing.harvestDate || null,
     listing.availableDate || null, listing.notes || '', listing.status, listing.createdAt]
  );
  return listing;
}

function updateListing(id, patch) {
  const existing = findListingById(id);
  if (!existing) return null;
  const fields = Object.keys(patch);
  if (!fields.length) return existing;

  const sets = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => patch[f]);
  run(`UPDATE listings SET ${sets} WHERE id = ?`, [...values, id]);
  return findListingById(id);
}

function removeListing(id) {
  run('DELETE FROM listings WHERE id = ?', [id]);
  run('DELETE FROM interests WHERE listingId = ?', [id]);
  run('DELETE FROM favorites WHERE listingId = ?', [id]);
}

/* ------------------------------------------------------------------ */
/* Interests (buyer -> listing)                                        */
/* ------------------------------------------------------------------ */

function addInterest(interest) {
  interest.id = genId('i');
  interest.createdAt = new Date().toISOString();
  run(
    'INSERT INTO interests (id, listingId, buyerId, message, createdAt) VALUES (?, ?, ?, ?, ?)',
    [interest.id, interest.listingId, interest.buyerId, interest.message || null, interest.createdAt]
  );
  return interest;
}

function findInterestsByListing(listingId) {
  return all('SELECT * FROM interests WHERE listingId = ? ORDER BY createdAt', [listingId]);
}

function findInterestsByBuyer(buyerId) {
  return all('SELECT * FROM interests WHERE buyerId = ? ORDER BY createdAt', [buyerId]);
}

function countInterests() {
  return count('SELECT 1 FROM interests');
}

function findInterestsForFarmer(farmerId) {
  return all(
    `SELECT i.* FROM interests i
     JOIN listings l ON l.id = i.listingId
     WHERE l.farmerId = ?
     ORDER BY i.createdAt`,
    [farmerId]
  );
}

/* ------------------------------------------------------------------ */
/* Favorites (buyer saves a listing)                                   */
/* ------------------------------------------------------------------ */

function isFavorite(buyerId, listingId) {
  return (
    count('SELECT 1 FROM favorites WHERE buyerId = ? AND listingId = ?', [buyerId, listingId]) > 0
  );
}

// Returns true if the listing was newly added, false if it was removed.
function toggleFavorite(buyerId, listingId) {
  const existing = get('SELECT id FROM favorites WHERE buyerId = ? AND listingId = ?', [
    buyerId,
    listingId,
  ]);
  if (existing) {
    run('DELETE FROM favorites WHERE id = ?', [existing.id]);
    return false; // removed
  }
  run(
    'INSERT INTO favorites (id, buyerId, listingId, createdAt) VALUES (?, ?, ?, ?)',
    [genId('f'), buyerId, listingId, new Date().toISOString()]
  );
  return true; // added
}

function findFavoritesByBuyer(buyerId) {
  return all('SELECT * FROM favorites WHERE buyerId = ? ORDER BY createdAt', [buyerId]);
}

/* ------------------------------------------------------------------ */
/* Legacy migration (data/store.json -> SQLite)                        */
/* ------------------------------------------------------------------ */

function migrateFromJson() {
  if (!fs.existsSync(LEGACY_FILE)) return;
  if (countUsers() > 0) return; // SQLite already has users

  let store;
  try {
    store = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf8'));
  } catch (err) {
    console.error('Could not read legacy data/store.json:', err.message);
    return;
  }

  const users = store.users || [];
  const listings = store.listings || [];
  const interests = store.interests || [];
  const favorites = store.favorites || [];

  if (!users.length && !listings.length) return;

  const insert = (sql, rows) => {
    const stmt = db.prepare(sql);
    try {
      for (const r of rows) stmt.run([
        r.id, r.name || null, r.email || null, r.username || null, r.passwordHash || null, r.role || null,
        r.village || null, r.phone || null, r.address || null, r.landSize || null,
        r.businessType || null, r.active === false ? 0 : 1, r.createdAt || null, r.updatedAt || null,
      ]);
    } finally {
      stmt.free();
    }
  };

  try {
    db.run('BEGIN');
    insert(
      `INSERT INTO users (id, name, email, username, passwordHash, role, village, phone,
                          address, landSize, businessType, active, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      users
    );
    const lStmt = db.prepare(
      `INSERT INTO listings (id, farmerId, farmerName, crop, variety, quantity, unit,
                             price, priceUnit, quality, location, district,
                             harvestDate, availableDate, notes, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const l of listings) {
      lStmt.run([
        l.id, l.farmerId, l.farmerName, l.crop, l.variety || null, l.quantity,
        l.unit, l.price, l.priceUnit, l.quality || null, l.location || null,
        l.district || null, l.harvestDate || null, l.availableDate || null,
        l.notes || '', l.status || 'active', l.createdAt,
      ]);
    }
    lStmt.free();
    const iStmt = db.prepare(
      'INSERT INTO interests (id, listingId, buyerId, message, createdAt) VALUES (?, ?, ?, ?, ?)'
    );
    for (const i of interests) {
      iStmt.run([i.id, i.listingId, i.buyerId, i.message || null, i.createdAt]);
    }
    iStmt.free();
    const fStmt = db.prepare(
      'INSERT INTO favorites (id, buyerId, listingId, createdAt) VALUES (?, ?, ?, ?)'
    );
    for (const f of favorites) {
      fStmt.run([f.id, f.buyerId, f.listingId, f.createdAt]);
    }
    fStmt.free();
    db.run('COMMIT');

    dirty = true;
    persist();
    console.log(
      `✅ Imported legacy data into SQLite: ${users.length} users, ${listings.length} listings, ` +
        `${interests.length} interests, ${favorites.length} favorites`
    );
  } catch (err) {
    db.run('ROLLBACK');
    console.error('Legacy import failed:', err && err.message ? err.message : err);
  }
}

/* ------------------------------------------------------------------ */
/* Seeding + admin helpers                                             */
/* ------------------------------------------------------------------ */

function countUsers() {
  return count('SELECT 1 FROM users');
}

// Replaces all data with a fresh demo store (used by `npm run seed`).
function seedStore(store) {
  assertReady();
  db.run('BEGIN');
  try {
    db.run('DELETE FROM favorites');
    db.run('DELETE FROM interests');
    db.run('DELETE FROM listings');
    db.run('DELETE FROM users');

    const uStmt = db.prepare(
      `INSERT INTO users (id, name, email, username, passwordHash, role, village, phone,
                          address, landSize, businessType, active, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const u of store.users) {
      uStmt.run([
        u.id, u.name || null, u.email || null, u.username || null, u.passwordHash || null, u.role || null,
        u.village || null, u.phone || null, u.address || null, u.landSize || null,
        u.businessType || null, u.active === false ? 0 : 1, u.createdAt || null, u.updatedAt || null,
      ]);
    }
    uStmt.free();

    const lStmt = db.prepare(
      `INSERT INTO listings (id, farmerId, farmerName, crop, variety, quantity, unit,
                             price, priceUnit, quality, location, district,
                             harvestDate, availableDate, notes, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const l of store.listings) {
      lStmt.run([
        l.id, l.farmerId, l.farmerName, l.crop, l.variety || null, l.quantity,
        l.unit, l.price, l.priceUnit, l.quality || null, l.location || null,
        l.district || null, l.harvestDate || null, l.availableDate || null,
        l.notes || '', l.status || 'active', l.createdAt,
      ]);
    }
    lStmt.free();

    const iStmt = db.prepare(
      'INSERT INTO interests (id, listingId, buyerId, message, createdAt) VALUES (?, ?, ?, ?, ?)'
    );
    for (const i of store.interests) {
      iStmt.run([i.id, i.listingId, i.buyerId, i.message || null, i.createdAt]);
    }
    iStmt.free();

    const fStmt = db.prepare(
      'INSERT INTO favorites (id, buyerId, listingId, createdAt) VALUES (?, ?, ?, ?)'
    );
    for (const f of store.favorites) {
      fStmt.run([f.id, f.buyerId, f.listingId, f.createdAt]);
    }
    fStmt.free();

    db.run('COMMIT');
    dirty = true;
    persist();
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
}

// Status for the admin "Database" page: engine, file, size, row counts,
// and the most recent rows of each table.
function getDbStatus() {
  assertReady();
  const stats = {
    engine: 'SQLite (' + JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'node_modules', 'sql.js', 'package.json'), 'utf8')).version + ')',
    file: DB_FILE,
    fileExists: fs.existsSync(DB_FILE),
    sizeBytes: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0,
    tables: [
      { name: 'users', rows: countUsers() },
      { name: 'listings', rows: count('SELECT 1 FROM listings') },
      { name: 'interests', rows: countInterests() },
      { name: 'favorites', rows: count('SELECT 1 FROM favorites') },
    ],
    recent: {
      users: all('SELECT id, name, email, role, village, active, createdAt FROM users ORDER BY createdAt DESC LIMIT 10'),
      listings: all('SELECT id, crop, variety, quantity, unit, price, priceUnit, farmerName, status, createdAt FROM listings ORDER BY createdAt DESC LIMIT 10'),
      interests: all('SELECT id, listingId, buyerId, message, createdAt FROM interests ORDER BY createdAt DESC LIMIT 5'),
      favorites: all('SELECT id, buyerId, listingId, createdAt FROM favorites ORDER BY createdAt DESC LIMIT 5'),
    },
  };
  return stats;
}

function shortStats() {
  const r = all("SELECT 'users' t, COUNT(*) n FROM users UNION ALL SELECT 'listings', COUNT(*) FROM listings UNION ALL SELECT 'interests', COUNT(*) FROM interests UNION ALL SELECT 'favorites', COUNT(*) FROM favorites");
  return r.map((x) => `${x.t}=${x.n}`).join(', ');
}

/* ------------------------------------------------------------------ */

module.exports = {
  init,
  genId,
  // users
  getUsers,
  findUserById,
  findUserByEmail,
  findUserByLogin,
  findUserByMobile,
  addUser,
  updateUser,
  countUsersByRole,
  // listings
  getListings,
  findListingById,
  addListing,
  updateListing,
  removeListing,
  // interests
  addInterest,
  findInterestsByListing,
  findInterestsByBuyer,
  findInterestsForFarmer,
  countInterests,
  // favorites
  isFavorite,
  toggleFavorite,
  findFavoritesByBuyer,
  // seeding + status
  countUsers,
  seedStore,
  getDbStatus,
};