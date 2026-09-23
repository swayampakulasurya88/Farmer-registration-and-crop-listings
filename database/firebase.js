// database/firebase.js
// Optional Firebase Realtime Database mirror for KrishiSetu.
//
// The built-in backend (SQLite for app data + embedded PostgreSQL for
// forgot-password OTPs + SSE realtime sync) works with zero configuration and
// zero accounts. If you *also* want the data mirrored to Google Firebase,
// activate it with two environment variables:
//
//   FIREBASE_SERVICE_ACCOUNT=/absolute/path/to/serviceAccountKey.json
//   FIREBASE_DATABASE_URL=https://<your-project>-default-rtdb.firebaseio.com
//
// How to get those:
//   1. console.firebase.google.com → create a project
//   2. Project settings → Service accounts → "Generate new private key"
//      (downloads the serviceAccountKey.json file)
//   3. Database → "Create database" in Realtime Database mode
//
// When active, every data mutation is ALSO pushed to Firebase Realtime DB so
// other consumers (mobile apps, dashboards, reports) stay in sync with the
// district platform.

let admin = null;
let app = null;
let state = 'disabled';
let message =
  'Firebase not configured — set FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATABASE_URL to activate';

function status() {
  return {
    engine: 'Firebase Realtime Database',
    state,
    message,
    databaseURL: process.env.FIREBASE_DATABASE_URL || '',
  };
}

async function start() {
  if (app) return true;
  const saPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  const dbUrl = process.env.FIREBASE_DATABASE_URL;
  if (!saPath || !dbUrl) return false; // not configured — stays disabled

  const fs = require('fs');
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    admin = require('firebase-admin');
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: dbUrl,
    });
    state = 'connected';
    message = 'connected to Firebase Realtime Database';
    console.log('🔥 Firebase Realtime Database mirror: ACTIVE');
    return true;
  } catch (err) {
    state = 'error';
    message = err.message || String(err);
    console.error('⚠️  Firebase mirror failed to start:', message);
    return false;
  }
}

// Push a snapshot of the whole platform data to Firebase.
// Returns false when Firebase is not configured.
async function pushSnapshot(data) {
  if (!app) return false;
  try {
    await admin.database().ref('krishisetu').set(data ? JSON.parse(JSON.stringify(data)) : {});
    return true;
  } catch (err) {
    console.error('Firebase push failed:', err.message);
    return false;
  }
}

module.exports = { start, status, pushSnapshot };