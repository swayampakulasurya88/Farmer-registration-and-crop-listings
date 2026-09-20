// utils/format.js
// Small display helpers shared across routes and templates.

const { DISTRICT } = require('../config');

// "₹ 1,25,000"
function inr(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

// Converts a listing's quantity to kilograms (for aggregation).
const KG_MULTIPLIER = {
  kg: 1,
  quintal: 100,
  tonne: 1000,
  'sack (50 kg)': 50,
  dozen: 12, // approximate per-dozen weight for volume view
};

function kilosOf(listing) {
  const m = KG_MULTIPLIER[listing.unit] || 1;
  return Number(listing.quantity || 0) * m;
}

function fmtQty(listing) {
  return `${Number(listing.quantity).toLocaleString('en-IN')} ${listing.unit}`;
}

// "20 Sep 2026"
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function cropEmoji(crop) {
  return '🌾'; // fallback, real map lives in config.CROP_EMOJI (templates use it)
}

module.exports = { inr, kilosOf, fmtQty, fmtDate, cropEmoji, DISTRICT };