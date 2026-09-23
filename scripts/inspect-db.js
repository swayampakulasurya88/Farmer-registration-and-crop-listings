// scripts/inspect-db.js
// Quick terminal check that KrishiSetu's SQLite database is working and
// see how many records are stored — run with:  npm run db:status

const path = require('path');
const fs = require('fs');
const db = require(path.join(__dirname, '..', 'data', 'db'));

async function main() {
  await db.init();
  const s = db.getDbStatus();

  console.log('————————————————————————————————————————————');
  console.log('🌾 KrishiSetu database status');
  console.log('————————————————————————————————————————————');
  console.log('Engine    :', s.engine);
  console.log('File      :', s.file);
  console.log('Size      :', s.fileExists ? s.sizeBytes + ' bytes' : 'MISSING');
  console.log('');
  console.log('Table          Rows');
  console.log(' ' + '-'.repeat(18));
  for (const t of s.tables) {
    console.log(' ' + t.name.padEnd(13) + ' ' + String(t.rows).padStart(5));
  }
  console.log('');

  const loggedInUserCount = s.recent.users.length;
  console.log(`Latest ${loggedInUserCount} users:`);
  for (const u of s.recent.users) {
    console.log(
      `  • ${u.name} — ${u.email} (${u.role}, ${u.village || '—'}) ${u.active === 1 ? '✅' : '🚫'}`
    );
  }
  console.log('');
  console.log(`Latest ${s.recent.listings.length} listings:`);
  for (const l of s.recent.listings) {
    console.log(`  • ${l.crop} — ${l.quantity} ${l.unit} @ ₹${l.price}/${l.priceUnit} (${l.status})`);
  }
}

main().catch((err) => {
  console.error('Inspect failed:', err);
  process.exit(1);
});