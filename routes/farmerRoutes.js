// routes/farmerRoutes.js
// Farmer dashboard: profile summary, crop-listing CRUD, interests received.

const express = require('express');
const db = require('../data/db');
const config = require('../config');
const { requireFarmer } = require('../middleware/auth');
const bus = require('../utils/bus');

const router = express.Router();

/* ------------------------ Dashboard -------------------------------- */

router.get('/farmer/dashboard', requireFarmer, (req, res) => {
  const farmer = req.currentUser;
  const myListings = db
    .getListings()
    .filter((l) => l.farmerId === farmer.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // interests received, with the buyer's details + listing context
  const interests = db
    .findInterestsForFarmer(farmer.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((i) => ({
      interest: i,
      buyer: db.findUserById(i.buyerId),
      listing: db.findListingById(i.listingId),
    }));

  const activeCount = myListings.filter((l) => l.status === 'active').length;
  const interestCount = interests.length;

  res.render('farmer/dashboard', {
    title: `${farmer.name} — Dashboard`,
    farmer,
    listings: myListings,
    interests,
    activeCount,
    interestCount,
  });
});

/* --------------------- New listing form ---------------------------- */

router.get('/farmer/listings/new', requireFarmer, (req, res) => {
  res.render('farmer/listingForm', {
    title: 'Add a crop listing',
    listing: null,
    errors: {},
    config,
  });
});

/* ------------------------- Create listing -------------------------- */

function validateListing(body) {
  const errors = {};
  if (!config.CROPS.includes(body.crop)) errors.crop = 'Choose a crop from the list.';
  if (!body.variety || !String(body.variety).trim()) errors.variety = 'Enter the variety (or "local").';
  if (!body.quantity || Number(body.quantity) <= 0) errors.quantity = 'Enter a quantity greater than 0.';
  if (!config.UNITS.includes(body.unit)) errors.unit = 'Choose a unit.';
  if (body.price === '' || body.price === undefined || Number(body.price) < 0) {
    errors.price = 'Enter a valid price.';
  }
  if (!config.PRICE_UNITS.includes(body.priceUnit)) errors.priceUnit = 'Choose a price unit.';
  if (!config.QUALITIES.includes(body.quality)) errors.quality = 'Choose a quality grade.';
  if (!body.location || !String(body.location).trim()) errors.location = 'Enter pickup location (village).';
  if (!body.availableDate) errors.availableDate = 'Pick an availability date.';
  return errors;
}

function listingFromBody(body) {
  return {
    crop: body.crop,
    variety: String(body.variety).trim(),
    quantity: Number(body.quantity),
    unit: body.unit,
    price: Number(body.price),
    priceUnit: body.priceUnit,
    quality: body.quality,
    location: String(body.location).trim(),
    harvestDate: body.harvestDate || null,
    availableDate: body.availableDate,
    notes: String(body.notes || '').trim(),
  };
}

router.post('/farmer/listings', requireFarmer, (req, res) => {
  const errors = validateListing(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).render('farmer/listingForm', {
      title: 'Add a crop listing',
      listing: { ...listingFromBody(req.body), farmerId: req.currentUser.id },
      errors,
      config,
    });
  }
  const listing = db.addListing({
    ...listingFromBody(req.body),
    farmerId: req.currentUser.id,
    farmerName: req.currentUser.name,
    district: config.DISTRICT,
  });
  bus.broadcast('listings', { listingId: listing.id });
  res.redirect(`/listings/${listing.id}?msg=${encodeURIComponent('Your ' + listing.crop + ' listing is now live.')}`);
});

/* ------------------------ Edit listing form ------------------------ */

router.get('/farmer/listings/:id/edit', requireFarmer, (req, res) => {
  const listing = db.findListingById(req.params.id);
  if (!listing || listing.farmerId !== req.currentUser.id) {
    return res.status(403).render('error', {
      title: 'Not your listing',
      status: 403,
      message: 'You can only edit your own listings.',
    });
  }
  res.render('farmer/listingForm', {
    title: `Edit — ${listing.crop}`,
    listing,
    errors: {},
    config,
  });
});

/* ------------------------- Update listing -------------------------- */

router.put('/farmer/listings/:id', requireFarmer, (req, res) => {
  const existing = db.findListingById(req.params.id);
  if (!existing || existing.farmerId !== req.currentUser.id) {
    return res.status(403).render('error', {
      title: 'Not your listing',
      status: 403,
      message: 'You can only edit your own listings.',
    });
  }

  const errors = validateListing(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).render('farmer/listingForm', {
      title: `Edit — ${existing.crop}`,
      listing: { ...existing, ...listingFromBody(req.body) },
      errors,
      config,
    });
  }

  db.updateListing(existing.id, listingFromBody(req.body));
  bus.broadcast('listings', { listingId: existing.id });
  res.redirect(`/farmer/dashboard?msg=${encodeURIComponent(existing.crop + ' listing updated.')}`);
});

/* ------------------------ Mark sold / active ----------------------- */

router.post('/farmer/listings/:id/status', requireFarmer, (req, res) => {
  const listing = db.findListingById(req.params.id);
  if (!listing || listing.farmerId !== req.currentUser.id) {
    return res.status(403).render('error', {
      title: 'Not your listing',
      status: 403,
      message: 'You can only change your own listings.',
    });
  }
  const next = listing.status === 'active' ? 'sold' : 'active';
  db.updateListing(listing.id, { status: next });
  bus.broadcast('listings', { listingId: listing.id });
  const msg = next === 'sold' ? 'marked as sold' : 'marked as available again';
  res.redirect(`/farmer/dashboard?msg=${encodeURIComponent(listing.crop + ' ' + msg + '.')}`);
});

/* ------------------------- Delete listing -------------------------- */

router.delete('/farmer/listings/:id', requireFarmer, (req, res) => {
  const listing = db.findListingById(req.params.id);
  if (!listing || listing.farmerId !== req.currentUser.id) {
    return res.status(403).render('error', {
      title: 'Not your listing',
      status: 403,
      message: 'You can only delete your own listings.',
    });
  }
  db.removeListing(listing.id);
  bus.broadcast('listings', { listingId: listing.id });
  res.redirect('/farmer/dashboard?msg=' + encodeURIComponent(listing.crop + ' listing deleted.'));
});

module.exports = router;