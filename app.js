// app.js
// Express application setup: middleware, view engine, route mounting.
// server.js is the tiny entry point that starts this app.

require('dotenv').config(); // loads SMTP_* secrets from .env (git-ignored)

const path = require('path');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');

const config = require('./config');
const { attachUser } = require('./middleware/auth');
const { attachLang } = require('./utils/i18n');
const bus = require('./utils/bus');
const pg = require('./database/pg');
const fb = require('./database/firebase');

const app = express();

/* ------------------------------------------------------------------ */
/* View engine                                                         */
/* ------------------------------------------------------------------ */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ------------------------------------------------------------------ */
/* Middleware                                                          */
/* ------------------------------------------------------------------ */
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(
  session({
    name: 'krishisetu.sid',
    secret: process.env.SESSION_SECRET || 'krishisetu-demo-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

// Load the logged-in user (if any) for every request.
app.use(attachUser);

// Language (English / తెలుగు / हिन्दी): resolves the active language from
// ?lang= → session → cookie → browser, and exposes `t()` to all templates.
app.use(attachLang);

// Make site config (district, crops, villages, ...) available in all views.
app.use((req, res, next) => {
  res.locals.config = config;
  next();
});

// Pass simple ?msg= / ?err= query flashes through to templates.
app.use((req, res, next) => {
  if (req.query.msg) res.locals.msg = req.query.msg;
  if (req.query.err) res.locals.err = req.query.err;
  next();
});

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/listingRoutes'));
app.use('/', require('./routes/farmerRoutes'));
app.use('/', require('./routes/buyerRoutes'));
app.use('/', require('./routes/adminRoutes'));

/* ------------------------------------------------------------------ */
/* Realtime sync (Server-Sent Events)                                  */
/* ------------------------------------------------------------------ */
app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('retry: 3000\n\n');
  bus.addClient(res);
  req.on('close', () => bus.removeClient(res));
});

/* ------------------------------------------------------------------ */
/* Live system status (used by the UI + demos)                         */
/* ------------------------------------------------------------------ */
app.get('/api/status', async (req, res) => {
  const [otpRows, fbRows] = await Promise.all([
    pg.countOtps().catch(() => 0),
    Promise.resolve(0),
  ]);
  res.json({
    ok: true,
    uptimeSec: Math.round(process.uptime()),
    realtimeClients: bus.clientCount(),
    stores: {
      appData: { engine: 'SQLite (sql.js)', file: 'data/krishisetu.sqlite' },
      otp: { ...pg.status(), rows: otpRows },
      firebase: { ...fb.status(), rows: fbRows },
    },
  });
});

/* ------------------------------------------------------------------ */
/* 404 + error handler                                                 */
/* ------------------------------------------------------------------ */
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page not found',
    status: 404,
    message: "The page you are looking for does not exist or has been moved.",
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Something went wrong',
    status: 500,
    message: err.message || 'An unexpected error occurred. Please try again.',
  });
});

module.exports = app;