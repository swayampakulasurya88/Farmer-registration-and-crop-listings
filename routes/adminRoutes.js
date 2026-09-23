// routes/adminRoutes.js
// Admin panel: district overview, user & listing moderation, CSV export.

const express = require('express');
const db = require('../data/db');
const { requireAdmin } = require('../middleware/auth');
const { inr, fmtQty, fmtDate } = require('../utils/format');
const { cropVolume } = require('../utils/trends');
const bus = require('../utils/bus');
const pg = require('../database/pg');
const fb = require('../database/firebase');

const router = express.Router();

/* --------------------------- Dashboard ----------------------------- */

router.get('/admin', requireAdmin, (req, res) => {
  const users = db.getUsers();
  const listings = db.getListings();

  const totalValueApprox = listings
    .filter((l) => l.status === 'active')
    .reduce((s, l) => s + Number(l.quantity) * Number(l.price), 0);

  res.render('admin/dashboard', {
    title: 'Admin panel',
    stats: {
      farmers: users.filter((u) => u.role === 'farmer').length,
      buyers: users.filter((u) => u.role === 'buyer').length,
      activeListings: listings.filter((l) => l.status === 'active').length,
      totalValueApprox,
      interests: db.countInterests(),
    },
    users: users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    listings: listings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 15),
    volume: cropVolume(listings.filter((l) => l.status === 'active'), 3650),
    fmt: { inr, fmtQty, fmtDate },
  });
});

/* ------------------------- Database status ------------------------- */

router.get('/admin/db', requireAdmin, async (req, res) => {
  const [otpRows] = await Promise.all([pg.countOtps().catch(() => 0)]);
  res.render('admin/db', {
    title: 'Database status',
    db: db.getDbStatus(),
    inr,
    fmtQty,
    fmtDate,
    pgStatus: { ...pg.status(), rows: otpRows },
    fbStatus: fb.status(),
    rtClients: bus.clientCount(),
    fmtSize: (bytes) =>
      bytes >= 1048576
        ? (bytes / 1048576).toFixed(2) + ' MB'
        : bytes >= 1024
          ? (bytes / 1024).toFixed(1) + ' KB'
          : bytes + ' bytes',
  });
});

/* --------------------- Moderating a listing ------------------------ */

router.post('/admin/listings/:id/remove', requireAdmin, (req, res) => {
  const listing = db.findListingById(req.params.id);
  if (!listing) return res.redirect('/admin?err=Listing+not+found');
  db.removeListing(listing.id);
  bus.broadcast('listings', { listingId: listing.id });
  res.redirect('/admin?msg=' + encodeURIComponent(`Listing "${listing.crop}" removed.`));
});

/* -------------------- Deactivate / reactivate user ----------------- */

router.post('/admin/users/:id/deactivate', requireAdmin, (req, res) => {
  const target = db.findUserById(req.params.id);
  if (!target) return res.redirect('/admin?err=User+not+found');
  if (target.id === req.currentUser.id) {
    return res.redirect('/admin?err=You+cannot+deactivate+your+own+account');
  }
  db.updateUser(target.id, { active: false });
  bus.broadcast('users', { userId: target.id });
  res.redirect('/admin?msg=' + encodeURIComponent(`${target.name} deactivated. Their listings are hidden.`));
});

router.post('/admin/users/:id/activate', requireAdmin, (req, res) => {
  const target = db.findUserById(req.params.id);
  if (!target) return res.redirect('/admin?err=User+not+found');
  db.updateUser(target.id, { active: true });
  bus.broadcast('users', { userId: target.id });
  res.redirect('/admin?msg=' + encodeURIComponent(`${target.name} reactivated.`));
});

/* --------------------------- CSV export ---------------------------- */

router.get('/admin/export', requireAdmin, (req, res) => {
  const userMap = new Map(db.getUsers().map((u) => [u.id, u]));
  const interestCounts = {};
  db.getListings().forEach((l) => {
    interestCounts[l.id] = db.findInterestsByListing(l.id).length;
  });

  const header = [
    'id', 'crop', 'variety', 'quantity', 'unit', 'price', 'priceUnit',
    'quality', 'harvestDate', 'availableDate', 'location', 'district',
    'farmerName', 'farmerVillage', 'farmerContact', 'farmerEmail',
    'status', 'createdAt', 'interestCount',
  ];

  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const rows = db.getListings().map((l) => {
    const owner = userMap.get(l.farmerId) || {};
    return [
      l.id, l.crop, l.variety, l.quantity, l.unit, l.price, l.priceUnit,
      l.quality, l.harvestDate, l.availableDate, l.location, l.district,
      owner.name, owner.village, owner.phone, owner.email,
      l.status, l.createdAt, interestCounts[l.id] || 0,
    ].map(esc).join(',');
  });

  const csv = header.join(',') + '\n' + rows.join('\n');

  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="krishisetu-listings-${stamp}.csv"`
  );
  res.send('\uFEFF' + csv); // BOM so Excel opens UTF-8 correctly
});

module.exports = router;