// server.js
// Entry point — starts the PostgreSQL OTP store + optional Firebase mirror,
// waits for the SQLite database to be ready, seeds demo data if the DB is
// empty, then starts the KrishiSetu web server.
// Run with:  npm start   (or  npm run dev  for auto-restart)

const db = require('./data/db');
const { ensureSeeded } = require('./seed');
const pg = require('./database/pg');
const fb = require('./database/firebase');

async function main() {
  await db.init();   // open / create data/krishisetu.sqlite
  ensureSeeded();    // demo data only when the database is empty

  // PostgreSQL (forgot-password OTP store) — fails soft to in-memory.
  await pg.start();

  // Optional Firebase mirror — only activates when configured.
  await fb.start();

  const app = require('./app');
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log('🌾 KrishiSetu — Farmer & Crop Listings');
    console.log(`   District : ${process.env.DISTRICT || 'Krishna District'}`);
    console.log(`   URL      : http://localhost:${PORT}`);
    console.log(`   Realtime : SSE /events (${busCount()} tabs watching live) — no page refresh needed`);
  });

  // Graceful shutdown for servers/orchestrators (Docker, PM2, Railway…):
  // stop the embedded PostgreSQL cluster cleanly before exiting.
  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    try {
      await pg.stop();
    } catch (e) { /* already stopped */ }
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Small helper so the banner shows how many tabs are watching live.
function busCount() {
  try {
    return require('./utils/bus').clientCount();
  } catch (e) {
    return 0;
  }
}

main().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});