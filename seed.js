// seed.js
// Creates demo data (users, listings, interests, favorites) so the
// website is instantly presentable for a demo/viva.
//
//   npm run seed      -> fresh demo store (overwrites)
//   npm start         -> auto-seeds only when data/store.json is missing

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { VILLAGES, CROPS, BUSINESS_TYPES } = require('./config');

const STORE_FILE = path.join(__dirname, 'data', 'store.json');

const hash = (pw) => bcrypt.hashSync(pw, 10);

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function buildDemoStore() {
  // ---- Users ---------------------------------------------------------
  const admin = {
    id: 'u_admin',
    name: 'Surya S',
    email: 'suryas@krishisetu.gov',
    username: 'SURYAS',
    passwordHash: hash('SURYAS2007'),
    role: 'admin',
    village: 'Vijayawada',
    phone: '0866-2471111',
    active: true,
    createdAt: daysAgo(10),
  };

  const farmers = [
    {
      id: 'u_f1', name: 'Ramesh Chandra', email: 'ramesh@demo.in',
      passwordHash: hash('farmer123'), role: 'farmer', village: 'Andipalem',
      phone: '9876512341', landSize: '5 acres', active: true, createdAt: daysAgo(45),
    },
    {
      id: 'u_f2', name: 'Lakshmi Devi', email: 'lakshmi@demo.in',
      passwordHash: hash('farmer123'), role: 'farmer', village: 'Gudivada',
      phone: '9876512342', landSize: '8 acres', active: true, createdAt: daysAgo(40),
    },
    {
      id: 'u_f3', name: 'Venkateswara Rao', email: 'venkat@demo.in',
      passwordHash: hash('farmer123'), role: 'farmer', village: 'Machilipatnam',
      phone: '9876512343', landSize: '12 acres', active: true, createdAt: daysAgo(38),
    },
  ];

  const buyers = [
    {
      id: 'u_b1', name: 'Sri Sai Traders', email: 'buyer@demo.in',
      passwordHash: hash('buyer123'), role: 'buyer', village: 'Vijayawada',
      phone: '9988776655', businessType: BUSINESS_TYPES[0], active: true,
      createdAt: daysAgo(35),
    },
    {
      id: 'u_b2', name: 'Anand Super Stores', email: 'anand@demo.in',
      passwordHash: hash('buyer123'), role: 'buyer', village: 'Nuzvid',
      phone: '9988776656', businessType: BUSINESS_TYPES[1], active: true,
      createdAt: daysAgo(30),
    },
  ];

  // ---- Listings (spread over ~8 weeks so the price charts look alive) --
  // [crop, variety, qty, unit, price, priceUnit, quality, village, farmerId, farmer, daysAgo, harvestDaysAgo]
  const raw = [
    ['Tomato', 'Desi (local)', 2000, 'kg', 26, 'per kg', 'Grade A', 'Andipalem', 'u_f1', 'Ramesh Chandra', 3, 5],
    ['Tomato', 'Hybrid', 1500, 'kg', 32, 'per kg', 'Premium', 'Gudivada', 'u_f2', 'Lakshmi Devi', 1, 4],
    ['Onion', 'Bellary Red', 600, 'quintal', 2450, 'per quintal', 'Grade A', 'Machilipatnam', 'u_f3', 'Venkateswara Rao', 5, 20],
    ['Brinjal', 'Purple Long', 800, 'kg', 24, 'per kg', 'Grade B', 'Andipalem', 'u_f1', 'Ramesh Chandra', 2, 6],
    ['Chilli', 'Guntur S4', 300, 'kg', 95, 'per kg', 'Premium', 'Gudivada', 'u_f2', 'Lakshmi Devi', 4, 25],
    ['Potato', 'Kufri Jyoti', 1200, 'kg', 28, 'per kg', 'Grade A', 'Machilipatnam', 'u_f3', 'Venkateswara Rao', 6, 30],
    ['Cabbage', 'Golden Acre', 700, 'kg', 18, 'per kg', 'Grade A', 'Gudivada', 'u_f2', 'Lakshmi Devi', 7, 8],
    ['Cauliflower', 'Pusa Snowball', 500, 'kg', 22, 'per kg', 'Grade B', 'Andipalem', 'u_f1', 'Ramesh Chandra', 8, 10],
    ['Carrot', 'Local', 400, 'kg', 35, 'per kg', 'Grade A', 'Machilipatnam', 'u_f3', 'Venkateswara Rao', 9, 12],
    ['Rice (Paddy)', 'BPT 5204', 800, 'quintal', 2300, 'per quintal', 'Grade A', 'Andipalem', 'u_f1', 'Ramesh Chandra', 12, 45],
    ['Groundnut', 'TMV-2', 350, 'quintal', 6200, 'per quintal', 'Premium', 'Gudivada', 'u_f2', 'Lakshmi Devi', 14, 50],
    ['Banana', 'Grand Naine', 900, 'dozen', 60, 'per dozen', 'Grade A', 'Machilipatnam', 'u_f3', 'Venkateswara Rao', 15, 7],
    ['Okra', 'Hybrid', 600, 'kg', 42, 'per kg', 'Premium', 'Andipalem', 'u_f1', 'Ramesh Chandra', 16, 9],
    ['Maize', 'Hybrid 421', 450, 'quintal', 2100, 'per quintal', 'Grade B', 'Gudivada', 'u_f2', 'Lakshmi Devi', 20, 55],
    ['Tomato', 'Desi (local)', 1000, 'kg', 18, 'per kg', 'Grade B', 'Machilipatnam', 'u_f3', 'Venkateswara Rao', 22, 24],
    ['Onion', 'Nashik Red', 400, 'quintal', 2650, 'per quintal', 'Premium', 'Andipalem', 'u_f1', 'Ramesh Chandra', 25, 30],
    ['Chilli', 'Guntur S4', 250, 'kg', 78, 'per kg', 'Grade B', 'Machilipatnam', 'u_f3', 'Venkateswara Rao', 28, 32],
    ['Brinjal', 'Green Round', 500, 'kg', 30, 'per kg', 'Grade A', 'Gudivada', 'u_f2', 'Lakshmi Devi', 30, 33],
    ['Cotton', 'RCH-2', 200, 'quintal', 7200, 'per quintal', 'Grade A', 'Machilipatnam', 'u_f3', 'Venkateswara Rao', 33, 60],
    ['Tomato', 'Hybrid', 900, 'kg', 22, 'per kg', 'Grade A', 'Andipalem', 'u_f1', 'Ramesh Chandra', 38, 40],
    ['Potato', 'Kufri Sindhuri', 700, 'kg', 33, 'per kg', 'Grade A', 'Gudivada', 'u_f2', 'Lakshmi Devi', 42, 45],
    ['Cabbage', 'Golden Acre', 300, 'kg', 15, 'per kg', 'Grade C', 'Machilipatnam', 'u_f3', 'Venkateswara Rao', 45, 48],
    ['Onion', 'Bellary Red', 300, 'quintal', 2200, 'per quintal', 'Grade B', 'Machilipatnam', 'u_f3', 'Venkateswara Rao', 50, 55],
  ];

  const listings = raw.map((r, i) => ({
    id: `l_${i + 1}`,
    farmerId: r[8],
    farmerName: r[9],
    crop: r[0],
    variety: r[1],
    quantity: r[2],
    unit: r[3],
    price: r[4],
    priceUnit: r[5],
    quality: r[6],
    location: r[7],
    district: 'Krishna District',
    harvestDate: daysAgo(r[11]).slice(0, 10),
    availableDate: daysAgo(r[10]).slice(0, 10),
    notes: i % 4 === 0 ? 'Fresh harvest, immediate delivery possible.' : '',
    status: i < 18 ? 'active' : 'sold',
    createdAt: daysAgo(r[10]),
  }));

  // ---- Interests & favorites ----------------------------------------
  const interests = [
    {
      id: 'i_1', listingId: 'l_1', buyerId: 'u_b1',
      message: 'Need 1,000 kg weekly. What is your best rate for bulk?',
      createdAt: daysAgo(1),
    },
    {
      id: 'i_2', listingId: 'l_3', buyerId: 'u_b1',
      message: 'Can you arrange transport to Vijayawada?',
      createdAt: daysAgo(2),
    },
    {
      id: 'i_3', listingId: 'l_4', buyerId: 'u_b2',
      message: 'We restock every Friday. Please share your contact.',
      createdAt: daysAgo(1),
    },
  ];

  const favorites = [
    { id: 'f_1', buyerId: 'u_b1', listingId: 'l_2', createdAt: daysAgo(3) },
    { id: 'f_2', buyerId: 'u_b1', listingId: 'l_5', createdAt: daysAgo(4) },
    { id: 'f_3', buyerId: 'u_b2', listingId: 'l_7', createdAt: daysAgo(2) },
  ];

  return { users: [admin, ...farmers, ...buyers], listings, interests, favorites };
}

// Writes a fresh demo store (used by `npm run seed`).
function seed(force = true) {
  const store = buildDemoStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
  return store;
}

// Auto-seeds only when the store file does not exist yet (used at startup).
function ensureSeeded() {
  if (!fs.existsSync(STORE_FILE)) {
    seed();
    console.log('🌾 No data store found — seeded demo data.');
  }
}

if (require.main === module) {
  const store = seed();
  console.log('✅ Demo data seeded into data/store.json');
  console.log('   Users:', store.users.length,
    '| Listings:', store.listings.length,
    '| Interests:', store.interests.length,
    '| Favorites:', store.favorites.length);
  console.log('\n   Login credentials:');
  console.log('   Admin : SURYAS / SURYAS2007           (also: suryas@krishisetu.gov)');
  console.log('   Farmer: ramesh@demo.in / farmer123');
  console.log('   Buyer : buyer@demo.in / buyer123');
}

module.exports = { seed, ensureSeeded, buildDemoStore };