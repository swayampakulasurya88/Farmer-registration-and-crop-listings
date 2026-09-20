// public/js/charts.js
// Renders the price-trend charts on /trends using Chart.js (loaded via CDN).
// Data is injected as window.CROP_CHART_DATA by the trends view.

(function () {
  'use strict';

  const cd = window.CROP_CHART_DATA;
  if (!cd || typeof window.Chart === 'undefined') return;

  /* ---------- Line chart: avg ₹/kg per week per crop ---------- */
  const priceCtx = document.getElementById('priceChart');
  if (priceCtx) {
    const datasets = cd.series.map((s) => ({
      label: s.crop,
      data: s.data,
      borderColor: s.color,
      backgroundColor: s.color + '26',
      borderWidth: 2.5,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5,
      spanGaps: true,
      fill: false,
    }));

    new window.Chart(priceCtx, {
      type: 'line',
      data: { labels: cd.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ₹${c.parsed.y ?? '—'}` } },
        },
        scales: {
          y: { beginAtZero: false, grid: { color: '#eef2ee' }, ticks: { callback: (v) => '₹' + v } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  /* ---------- Bar chart: listed volume (kg) per crop ---------- */
  const volumeCtx = document.getElementById('volumeChart');
  if (volumeCtx && cd.volume && cd.volume.length) {
    const volume = cd.volume;
    new window.Chart(volumeCtx, {
      type: 'bar',
      data: {
        labels: volume.map((v) => v.crop),
        datasets: [
          {
            label: 'Volume (kg)',
            data: volume.map((v) => v.volumeKg),
            backgroundColor: '#16a34a99',
            borderColor: '#15803d',
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#eef2ee' } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      },
    });
  }
})();