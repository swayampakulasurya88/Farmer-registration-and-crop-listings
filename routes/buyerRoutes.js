// routes/buyerRoutes.js
// Buyer actions: express interest in a listing, save favorites,
// and the buyer dashboard showing saved listings + interests sent.

const express = require('express');
const db = require('../data/db');
const { requireBuyer } = require('../middleware/auth');
const bus = require('../utils/bus');

const router = express.Router();

/* ---------------------- Express interest --------------------------- */

router.post('/listings/:id/interest', requireBuyer, (req, res) => {
  const listing = db.findListingById(req.params.id);
  if (!listing) {
    return res.redirect('/listings?err=' + encodeURIComponent('Listing not found.'));
  }
  if (listing.status !== 'active') {
    return res.redirect(
      `/listings/${listing.id}?err=` + encodeURIComponent('This listing is no longer available.')
    );
  }

  const existing = db
    .findInterestsByListing(listing.id)
    .some((i) => i.buyerId === req.currentUser.id);
  if (existing) {
    return res.redirect(
      `/listings/${listing.id}?err=` + encodeURIComponent('You already expressed interest in this listing.')
    );
  }

  db.addInterest({
    listingId: listing.id,
    buyerId: req.currentUser.id,
    message: String(req.body.message || '').trim().slice(0, 500),
  });
  bus.broadcast('interests', { listingId: listing.id });

  res.redirect(
    `/listings/${listing.id}?msg=` +
      encodeURIComponent("Interest sent — the farmer can now see your contact details.")
  );
});

/* ----------------------- Toggle favorite --------------------------- */

router.post('/listings/:id/favorite', requireBuyer, (req, res) => {
  const listing = db.findListingById(req.params.id);
  if (!listing) return res.redirect('/listings?err=Listing+not+found');

  const added = db.toggleFavorite(req.currentUser.id, listing.id);
  bus.broadcast('favorites', { listingId: listing.id, buyerId: req.currentUser.id });
  const back = req.get('Referer') || `/listings/${listing.id}`;
  res.redirect(back + (added ? '?msg=Saved+to+your+list' : '?msg=Removed+from+your+list'));
});

/* ------------------------ Buyer dashboard -------------------------- */

router.get('/buyer/dashboard', requireBuyer, (req, res) => {
  const me = req.currentUser;

  // Saved (favorite) listings
  const userMap = new Map(db.getUsers().map((u) => [u.id, u]));
  const favorites = db
    .findFavoritesByBuyer(me.id)
    .map((f) => {
      const listing = db.findListingById(f.listingId);
      if (!listing) return null;
      const owner = userMap.get(listing.farmerId);
      return {
        ...listing,
        farmerName: owner ? owner.name : 'Unknown',
        farmerVillage: owner ? owner.village : '',
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Interests sent
  const interests = db
    .findInterestsByBuyer(me.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((i) => {
      const listing = db.findListingById(i.listingId);
      if (!listing) return null;
      const owner = userMap.get(listing.farmerId);
      return {
        interest: i,
        listing: { ...listing, farmerName: owner ? owner.name : '', farmerContact: owner ? owner.phone : '' },
      };
    })
    .filter(Boolean);

  res.render('buyer/dashboard', {
    title: `${me.name} — Dashboard`,
    buyer: me,
    favorites,
    interests,
  });
});

module.exports = router;