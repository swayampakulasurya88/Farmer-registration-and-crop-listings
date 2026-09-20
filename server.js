// server.js
// Entry point — starts the KrishiSetu web server.
// Run with:  npm start   (or  npm run dev  for auto-restart)

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🌾 KrishiSetu — Farmer & Crop Listings');
  console.log(`   District : ${process.env.DISTRICT || 'Krishna District'}`);
  console.log(`   URL      : http://localhost:${PORT}`);
});