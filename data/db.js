// data/db.js
// Tiny JSON-file database. The whole store lives in data/store.json.
// This keeps the project dependency-free (no MySQL/MongoDB needed)
// while still giving a real, persistent, shared data layer.
// Swap this file for a real DB (MongoDB/MySQL) without touching routes.

const fs = require('fs');
const path = require('path');

const STORE_FILE = path.join(__dirname, 'store.json');

const EMPTY_STORE = { users: [], listings: [], interests: [], favorites: [] };

/* ------------------------------------------------------------------ */
/* Low-level helpers                                                   */
/* ------------------------------------------------------------------ */

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function load() {
  if (!fs.existsSync(STORE_FILE)) {
    save(clone(EMPTY_STORE));
    return clone(EMPTY_STORE);
  }
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  } catch (err) {
    console.error('Could not parse store.json, starting empty:', err.message);
    return clone(EMPTY_STORE);
  }
}

function save(store) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

function getUsers() {
  return load().users;
}

function findUserById(id) {
  return load().users.find((u) => u.id === id) || null;
}

function findUserByEmail(email) {
  const needle = String(email || '').trim().toLowerCase();
  return load().users.find((u) => u.email.toLowerCase() === needle) || null;
}

function addUser(user) {
  const store = load();
  user.id = genId('u');
  user.active = true;
  user.createdAt = new Date().toISOString();
  store.users.push(user);
  save(store);
  return user;
}

function updateUser(id, patch) {
  const store = load();
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  store.users[idx] = { ...store.users[idx], ...patch };
  save(store);
  return store.users[idx];
}

function countUsersByRole(role) {
  return load().users.filter((u) => u.role === role).length;
}

/* ------------------------------------------------------------------ */
/* Listings                                                            */
/* ------------------------------------------------------------------ */

function getListings() {
  return load().listings;
}

function findListingById(id) {
  return load().listings.find((l) => l.id === id) || null;
}

function addListing(listing) {
  const store = load();
  listing.id = genId('l');
  listing.status = 'active';
  listing.createdAt = new Date().toISOString();
  store.listings.push(listing);
  save(store);
  return listing;
}

function updateListing(id, patch) {
  const store = load();
  const idx = store.listings.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  store.listings[idx] = { ...store.listings[idx], ...patch };
  save(store);
  return store.listings[idx];
}

function removeListing(id) {
  const store = load();
  store.listings = store.listings.filter((l) => l.id !== id);
  // clean up related records
  store.interests = store.interests.filter((i) => i.listingId !== id);
  store.favorites = store.favorites.filter((f) => f.listingId !== id);
  save(store);
}

/* ------------------------------------------------------------------ */
/* Interests (buyer -> listing)                                        */
/* ------------------------------------------------------------------ */

function addInterest(interest) {
  const store = load();
  interest.id = genId('i');
  interest.createdAt = new Date().toISOString();
  store.interests.push(interest);
  save(store);
  return interest;
}

function findInterestsByListing(listingId) {
  return load().interests.filter((i) => i.listingId === listingId);
}

function findInterestsByBuyer(buyerId) {
  return load().interests.filter((i) => i.buyerId === buyerId);
}

function countInterests() {
  return load().interests.length;
}

function findInterestsForFarmer(farmerId) {
  const store = load();
  const myListingIds = new Set(
    store.listings.filter((l) => l.farmerId === farmerId).map((l) => l.id)
  );
  return store.interests.filter((i) => myListingIds.has(i.listingId));
}

/* ------------------------------------------------------------------ */
/* Favorites (buyer saves a listing)                                   */
/* ------------------------------------------------------------------ */

function isFavorite(buyerId, listingId) {
  return load().favorites.some(
    (f) => f.buyerId === buyerId && f.listingId === listingId
  );
}

// Returns true if the listing was newly added, false if it was removed.
function toggleFavorite(buyerId, listingId) {
  const store = load();
  const idx = store.favorites.findIndex(
    (f) => f.buyerId === buyerId && f.listingId === listingId
  );
  if (idx !== -1) {
    store.favorites.splice(idx, 1);
    save(store);
    return false; // removed
  }
  store.favorites.push({
    id: genId('f'),
    buyerId,
    listingId,
    createdAt: new Date().toISOString(),
  });
  save(store);
  return true; // added
}

function findFavoritesByBuyer(buyerId) {
  return load().favorites.filter((f) => f.buyerId === buyerId);
}

/* ------------------------------------------------------------------ */

module.exports = {
  genId,
  // users
  getUsers,
  findUserById,
  findUserByEmail,
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
};