// routes/listingRoutes.js
// Public pages: home, browse & filter listings, listing detail, price trends.

const express = require('express');
const db = require('../data/db');
const config = require('../config');
const { inr, fmtQty, fmtDate } = require('../utils/format');
const { buildWeeklyPriceSeries, cropVolume, latestPriceTable } = require('../utils/trends');

const router = express.Router();

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Attach farmer name/village to listings and drop listings whose farmer
// has been deactivated by the admin.
function viewableListings() {
  const users = db.getUsers();
  const byId = new Map(users.map((u) => [u.id, u]));
  return db
    .getListings()
    .filter((l) => {
      const owner = byId.get(l.farmerId);
      return owner && owner.active !== false;
    })
    .map((l) => {
      const owner = byId.get(l.farmerId);
      return {
        ...l,
        farmerName: owner ? owner.name : 'Unknown',
        farmerVillage: owner ? owner.village : '',
        farmerContact: owner ? owner.phone : '',
      };
    });
}

function activeListings() {
  return viewableListings().filter((l) => l.status === 'active');
}

/* ------------------------------ Home ------------------------------- */

router.get('/', (req, res) => {
  const listings = activeListings()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const totalKilos = activeListings().reduce((s, l) => s + l.quantity * (l.unit === 'kg' ? 1 : 0), 0);

  const me = req.session.userId ? db.findUserById(req.session.userId) : null;
  const favMap = {};
  if (me && me.role === 'buyer') {
    for (const f of db.findFavoritesByBuyer(me.id)) favMap[f.listingId] = true;
  }

  res.render('index', {
    title: `${config.DISTRICT} — Farmers & Buyers connect`,
    recent: listings,
    favMap,
    stats: {
      farmers: db.countUsersByRole('farmer'),
      buyers: db.countUsersByRole('buyer'),
      activeListings: activeListings().length,
      listedKg: totalKilos,
    },
    priceTable: latestPriceTable(activeListings()).slice(0, 6),
  });
});

/* ----------------------- Browse & filter --------------------------- */

router.get('/listings', (req, res) => {
  const { q, crop, village, quality, minPrice, maxPrice, sort } = req.query;

  let results = activeListings();

  if (q) {
    const needle = String(q).trim().toLowerCase();
    results = results.filter(
      (l) =>
        l.crop.toLowerCase().includes(needle) ||
        (l.variety || '').toLowerCase().includes(needle) ||
        l.location.toLowerCase().includes(needle) ||
        l.farmerName.toLowerCase().includes(needle)
    );
  }
  if (crop) results = results.filter((l) => l.crop === crop);
  if (village) results = results.filter((l) => l.location === village);
  if (quality) results = results.filter((l) => l.quality === quality);
  if (minPrice !== '' && minPrice !== undefined) {
    results = results.filter((l) => Number(l.price) >= Number(minPrice));
  }
  if (maxPrice !== '' && maxPrice !== undefined) {
    results = results.filter((l) => Number(l.price) <= Number(maxPrice));
  }

  // Price filters compare raw quoted price (₹ per kg / quintal / …).
  // The unit is always shown on the card so the comparison stays honest.
  const sorts = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    priceAsc: (a, b) => Number(a.price) - Number(b.price),
    priceDesc: (a, b) => Number(b.price) - Number(a.price),
    qtyDesc: (a, b) => Number(b.quantity) - Number(a.quantity),
  };
  results.sort(sorts[sort] || sorts.newest);

  // Which crops & villages currently have listings (dynamic filter options)
  const cropOptions = [...new Set(activeListings().map((l) => l.crop))].sort();
  const villageOptions = [...new Set(activeListings().map((l) => l.location))].sort();

  const me = req.session.userId ? db.findUserById(req.session.userId) : null;
  const favMap = {};
  if (me && me.role === 'buyer') {
    for (const f of db.findFavoritesByBuyer(me.id)) favMap[f.listingId] = true;
  }

  res.render('listings/browse', {
    title: 'Browse crop listings',
    listings: results,
    count: results.length,
    filters: { q, crop, village, quality, minPrice, maxPrice, sort },
    cropOptions,
    villageOptions,
    qualities: config.QUALITIES,
    favMap,
  });
});

/* -------------------------- Listing detail ------------------------- */

router.get('/listings/:id', (req, res) => {
  const raw = db.findListingById(req.params.id);
  if (!raw) {
    return res.status(404).render('error', {
      title: 'Listing not found',
      status: 404,
      message: 'This crop listing does not exist or was removed.',
    });
  }

  const owner = db.findUserById(raw.farmerId);
  if (!owner || owner.active === false) {
    return res.status(404).render('error', {
      title: 'Listing not found',
      status: 404,
      message: 'This crop listing is no longer available.',
    });
  }

  const listing = { ...raw, farmerName: owner.name, farmerVillage: owner.village, farmerContact: owner.phone };

  const related = activeListings()
    .filter((l) => l.id !== listing.id && l.crop === listing.crop)
    .slice(0, 4);

  const me = req.session.userId ? db.findUserById(req.session.userId) : null;
  const isOwner = me && me.id === listing.farmerId;
  const alreadyInterested =
    me && me.role === 'buyer'
      ? db
          .findInterestsByListing(listing.id)
          .some((i) => i.buyerId === me.id)
      : false;
  const fav = me && me.role === 'buyer' ? db.isFavorite(me.id, listing.id) : false;

  res.render('listings/detail', {
    title: `${listing.crop} — ${listing.variety || listing.quality}`,
    listing,
    related,
    isOwner,
    alreadyInterested,
    fav,
  });
});

/* --------------------------- Price trends -------------------------- */

router.get('/trends', (req, res) => {
  const listings = activeListings();
  const priceSeries = buildWeeklyPriceSeries(listings, 8);
  const volume = cropVolume(listings, 30);
  const table = latestPriceTable(listings);

  res.render('trends', {
    title: 'Price trends & market intelligence',
    chartJson: JSON.stringify({ labels: priceSeries.labels, series: priceSeries.series, volume }),
    table,
  });
});

module.exports = router;