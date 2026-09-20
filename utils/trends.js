// utils/trends.js
// Market-intelligence calculations on top of the structured listing records.
// Because every listing stores { crop, quantity, price, date } uniformly,
// we can aggregate: weekly average prices, volumes, and price-movements.

const { PALETTE } = require('../config');
const { kilosOf } = require('./format');

/* ------------------------------------------------------------------ */
/* Week helpers                                                        */
/* ------------------------------------------------------------------ */

// Monday 00:00 of the week containing `date`
function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0 = Sunday
  const diff = dow === 0 ? 6 : dow - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

/* ------------------------------------------------------------------ */
/* 1. Weekly average price per crop (₹/kg) — line chart                */
/* ------------------------------------------------------------------ */

// Only listings quoted "per kg" are comparable on one axis, so those feed
// the price chart (a stated limitation, kept in the UI note).
function buildWeeklyPriceSeries(listings, weeks = 8) {
  const now = new Date();
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const start = startOfWeek(d);
    buckets.push({
      start,
      end: new Date(start.getTime() + 7 * 86400000),
      label: start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      map: {}, // crop -> array of prices that week
    });
  }

  // Choose the top crops by number of per-kg listings (keeps chart readable)
  const countByCrop = {};
  for (const l of listings) {
    if (l.priceUnit !== 'per kg') continue;
    countByCrop[l.crop] = (countByCrop[l.crop] || 0) + 1;
  }
  const topCrops = Object.entries(countByCrop)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([crop]) => crop);

  for (const l of listings) {
    if (l.priceUnit !== 'per kg' || !topCrops.includes(l.crop)) continue;
    const created = new Date(l.createdAt);
    for (const b of buckets) {
      if (created >= b.start && created < b.end) {
        (b.map[l.crop] = b.map[l.crop] || []).push(Number(l.price));
      }
    }
  }

  const series = topCrops.map((crop, i) => ({
    crop,
    color: PALETTE[i % PALETTE.length],
    data: buckets.map(
      (b) => (b.map[crop] && b.map[crop].length ? Math.round(avg(b.map[crop]) * 100) / 100 : null)
    ),
  }));

  return { labels: buckets.map((b) => b.label), series };
}

/* ------------------------------------------------------------------ */
/* 2. Total volume per crop (kg) — bar chart                           */
/* ------------------------------------------------------------------ */

function cropVolume(listings, days = 30) {
  const since = new Date(Date.now() - days * 86400000);
  const byCrop = {};
  for (const l of listings) {
    if (l.status !== 'active') continue;
    if (new Date(l.createdAt) < since) continue;
    const kg = kilosOf(l);
    if (!kg) continue;
    byCrop[l.crop] = (byCrop[l.crop] || 0) + kg;
  }
  return Object.entries(byCrop)
    .map(([crop, volumeKg]) => ({ crop, volumeKg: Math.round(volumeKg) }))
    .sort((a, b) => b.volumeKg - a.volumeKg)
    .slice(0, 8);
}

/* ------------------------------------------------------------------ */
/* 3. Latest price table with change vs previous fortnight             */
/* ------------------------------------------------------------------ */

function latestPriceTable(listings) {
  const now = Date.now();
  const recentStart = now - 14 * 86400000;   // last 14 days
  const prevStart = now - 28 * 86400000;     // 14 days before that

  const rows = {}; // crop -> { recent: [], prev: [] }
  for (const l of listings) {
    if (l.priceUnit !== 'per kg' || l.status !== 'active') continue;
    const t = new Date(l.createdAt).getTime();
    if (t >= recentStart) {
      (rows[l.crop] = rows[l.crop] || { recent: [], prev: [] }).recent.push(Number(l.price));
    } else if (t >= prevStart) {
      (rows[l.crop] = rows[l.crop] || { recent: [], prev: [] }).prev.push(Number(l.price));
    }
  }

  const out = Object.entries(rows)
    .map(([crop, { recent, prev }]) => {
      const curr = Math.round(avg(recent) * 100) / 100;
      const before = Math.round(avg(prev) * 100) / 100;
      const change = recent.length && prev.length
        ? ((curr - before) / before) * 100
        : null;
      return { crop, price: curr, listings: recent.length, change: Math.round(change * 10) / 10, hasBase: prev.length > 0 };
    })
    .filter((r) => r.listings > 0)
    .sort((a, b) => b.listings - a.listings)
    .slice(0, 10);

  return out;
}

module.exports = { buildWeeklyPriceSeries, cropVolume, latestPriceTable, startOfWeek };