# 🌾 KrishiSetu — Farmer Registration & Crop Listings

> **A district-level shared, structured record of crop availability and prices — connecting farmers and buyers directly, with no middlemen.**

KrishiSetu is a complete web platform where:

- **Farmers** enter with name + mobile + address (no password), then post structured crop listings (crop, variety, quantity, price, quality, harvest/availability dates, pickup village).
- **Buyers** (wholesalers, retailers, traders, FPOs) search, filter and compare listings across the whole district, save favourites, and express interest — the farmer then sees their contact details.
- **Admins** get a district overview: users, listings, interests, price/volume summaries, moderation controls, and a **CSV export** for reporting.

Because every listing follows the *same fields*, the records become **searchable, filterable and analyzable** — that's the "structured record" at the heart of the project.

> ⚡ **Realtime by default.** Every open tab watches a Server-Sent Events channel (`/events`): when a listing is added/updated/sold, an interest or favorite is created, or an admin moderates something, all open pages update **in place — no page refresh needed**. You can watch a second browser tab update itself live.

---

## 🚀 Quick start

Prerequisite: [Node.js](https://nodejs.org) 18 or above (tested on v20).

```bash
npm install     # install dependencies
npm start       # start the server
```

Open **http://localhost:3000**

- On first run the app auto-seeds realistic demo data.
- Want a fresh demo dataset? `npm run seed`
- Run for a different district: `DISTRICT="Warangal" npm start`

Everything works with **zero configuration**: the embedded PostgreSQL server starts automatically (userspace, no sudo), and the forgot-password flow runs in **demo mode** (OTP shown on screen + console) until you configure SMTP.

### Demo accounts

| Role    | How to enter                                    |
|---------|-------------------------------------------------|
| Farmer  | Name **Ramesh Chandra** · Mobile **9876512341** · Village **Andipalem** |
| Buyer   | Name **Sri Sai Traders** · Mobile **9988776655** · Village **Vijayawada** |
| Admin   | **`SURYAS`** / `SURYAS2007` (username + password — the only password login) |

> Farmers & buyers enter with **name + mobile + address — no usernames or passwords**.
> First time = account created automatically; returning = recognised by mobile number.
> The address is editable any time from the **✏️ Edit** link in the header (admin sees it in the panel).
> Only the **admin** logs in with a username + password.

---

## 🗄️ Backend architecture

| Layer | What it is | Where |
|-------|------------|-------|
| **App data** | SQLite via sql.js (single file `data/krishisetu.sqlite`, no native build) | `data/db.js` |
| **Forgot-password OTPs** | **Embedded PostgreSQL** (`database/pg.js`) — real Postgres binaries via npm, runs userspace on port 5433; table `password_reset_otps`; falls back to in-memory if Postgres can't start | `database/pg.js`, `database/schema.sql`, `utils/otp.js` |
| **Realtime sync** | Server-Sent Events bus (`utils/bus.js` + `GET /events`) + client `realtime.js` — every mutation broadcasts a `sync` event and open pages re-render `<main>` silently | `utils/bus.js`, `app.js`, `public/js/realtime.js` |
| **Firebase (optional)** | Firebase Realtime Database mirror — activate with `FIREBASE_SERVICE_ACCOUNT` + `FIREBASE_DATABASE_URL` | `database/firebase.js` |

**Why embedded PostgreSQL?** The `embedded-postgres` npm package ships real Postgres binaries (initdb, postgres, psql) that run entirely in the project — no system install, no sudo, works on any machine with Node. The same `database/schema.sql` also includes the full users/listings/interests/favorites model, so the whole platform can be lifted onto Postgres (or your own `DATABASE_URL`) later.

**Why SSE for realtime?** Server-Sent Events is the simplest production-grade realtime transport — one way (server → browser), auto-reconnects by spec, works through proxies, and needs no WebSocket library. It gives you Firebase-RTDB-like live updates with zero accounts and zero cloud setup.

---

## 📧 Forgot password & OTP (admin account only)

Only the admin account holds a password, so recovery applies to it:

1. On the login page open the **Admin login** tab → **Forgot password?** and enter the admin username/email.
2. A **6-digit OTP** is generated and stored in **PostgreSQL** (10-minute expiry, one-time use, max 5 wrong attempts).
3. The OTP is emailed (see below); enter OTP + new password on the reset page.

**Demo mode (default):** no email server is configured, so the OTP is shown directly on the page and printed in the server console — perfect for a demo/viva.

**Real email (Gmail):** Google requires an **App Password** (regular passwords are blocked for SMTP):

1. Turn **ON 2-Step Verification** at myaccount.google.com/security
2. Create an App Password at https://myaccount.google.com/apppasswords
3. Put it in `.env` (see the commented `SMTP_*` block):

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS="abcd efgh ijkl mnop"    # the 16-char app password
MAIL_FROM="KrishiSetu <you@gmail.com>"
```

---

## ⚡ Realtime sync — how it works

1. Every page loads `public/js/realtime.js`, which opens `EventSource('/events')`.
2. Any mutation (new/edited/sold/deleted listing, interest, favorite, user registration, admin moderation) calls `bus.broadcast(...)`.
3. The bus pushes a `sync` event to every connected tab.
4. Each tab silently re-fetches its own URL and swaps `<main>` content in place — scroll position kept, charts re-rendered (`krishisetu:synced` event), a "Live sync" pill in the corner confirms the update.
5. While you are typing in a form or a dialog is open, the sync politely waits — your work is never disturbed.

Try it: open `/listings` in two tabs, add a listing from one of them — the other tab updates by itself.

Status endpoints: `GET /events` (SSE stream), `GET /api/status` (live JSON: SQLite + PostgreSQL rows + Firebase + connected tabs). The admin **Database status** page shows all three backends.

---

## 🔥 Firebase (optional)

To mirror KrishiSetu's data to Firebase Realtime Database:

1. Create a project at console.firebase.google.com
2. **Project settings → Service accounts → Generate new private key** (downloads `serviceAccountKey.json`)
3. **Build → Realtime Database → Create database**
4. Set two env vars in `.env`:

```bash
FIREBASE_SERVICE_ACCOUNT=/absolute/path/to/serviceAccountKey.json
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

When active, `database/firebase.js` connects at boot and pushes a full snapshot of the platform data to `krishisetu/` — other apps/dashboards/mobile clients can read the same live mirror. Without these vars, Firebase stays disabled and the app runs 100% on the built-in backends.

---

## 📁 Project structure (file-by-file)

```
Farmerregistrationandcroplistings/
│
├── server.js                 # Entry point — boots PostgreSQL + Firebase, then starts the server
├── app.js                    # Express app: middleware, sessions, SSE /events, /api/status, routes
├── config.js                 # District config: name, villages, crops, units, qualities, emojis, SMTP
├── seed.js                   # Demo-data generator (`npm run seed`) + auto-seed on first run
├── package.json              # Dependencies & scripts
├── .env                      # Secrets: SMTP (commented), PostgreSQL, Firebase (git-ignored)
│
├── data/
│   ├── db.js                 # SQLite (sql.js) data layer — users, listings, interests, favorites
│   └── krishisetu.sqlite     # The SQLite database file (auto-created — git-ignored)
│
├── database/
│   ├── schema.sql            # PostgreSQL schema (users, listings, interests, favorites, otps)
│   ├── pg.js                 # Embedded PostgreSQL manager + OTP row helpers (fail-soft)
│   └── firebase.js           # Optional Firebase Realtime DB mirror (inactive without env vars)
│
├── middleware/
│   └── auth.js               # attachUser + role guards (requireFarmer/Buyer/Admin)
│
├── routes/
│   ├── authRoutes.js         # Entry (name+mobile+address), admin login, profile, forgot/reset (OTP)
│   ├── listingRoutes.js      # Home page, browse+filter, listing detail, price trends
│   ├── farmerRoutes.js       # Farmer dashboard + crop-listing CRUD (+ realtime broadcasts)
│   ├── buyerRoutes.js        # Buyer dashboard, saved listings, express interest (+ broadcasts)
│   └── adminRoutes.js        # Admin panel, moderation, CSV export (+ broadcasts, DB status page)
│
├── utils/
│   ├── format.js             # ₹ formatting, quantity → kg conversion, date helpers
│   ├── trends.js             # Weekly price series, volume aggregation, price-movement tables
│   ├── otp.js                # OTP generation/verify — PostgreSQL store, in-memory fallback
│   ├── mailer.js             # OTP email: real SMTP or demo mode (prints OTP to console)
│   └── bus.js                # Realtime SSE hub: add/remove clients, broadcast(channel, data)
│
├── views/                    # EJS templates
│   ├── partials/
│   │   ├── header.ejs        # <head>, nav bar, flash alerts
│   │   ├── footer.ejs        # footer + scripts (incl. realtime.js)
│   │   ├── alerts.ejs        # success/error toasts
│   │   └── listingCard.ejs   # reusable crop-listing card
│   ├── index.ejs             # Landing: hero, stats, how-it-works, recent listings, price snapshot
│   ├── trends.ejs            # Price charts page (Chart.js)
│   ├── error.ejs             # 403/404/500 pages
│   ├── auth/                 # login (entry + admin tabs), forgot, reset
│   ├── profile.ejs           # edit name, mobile, village, address (editable), email
│   ├── listings/             # browse.ejs, detail.ejs
│   ├── farmer/               # dashboard.ejs, listingForm.ejs
│   ├── buyer/                # dashboard.ejs
│   └── admin/                # dashboard.ejs, db.ejs (SQLite + PostgreSQL + Firebase + realtime)
│
└── public/                   # static assets
    ├── css/style.css         # full responsive stylesheet (+ live-sync pill styles)
    └── js/
        ├── main.js           # nav toggle, confirm dialogs, role toggle, toasts
        ├── realtime.js       # EventSource client: silent auto-sync of <main>, live pill
        └── charts.js         # Chart.js charts — re-renders on 'krishisetu:synced'
```

---

## 🧭 Pages & routes

| URL | Who | Purpose |
|-----|-----|---------|
| `/` | everyone | Landing page with district stats, recent listings, price snapshot |
| `/listings` | everyone | Browse + filter (search, crop, village, quality, min/max price, sorting) |
| `/listings/:id` | everyone | Full structured record; contact + interest for logged-in users |
| `/trends` | everyone | Weekly price charts (₹/kg) and volume bar chart, live-computed |
| `/events` | everyone | Server-Sent Events realtime stream (auto-sync source) |
| `/api/status` | everyone | Live JSON status: SQLite, PostgreSQL OTP rows, Firebase, connected tabs |
| `/auth/login` | guests | Entry for farmers/buyers (name + mobile + address — no password) and admin login (`?tab=admin`) |
| `/auth/profile` | any user | Edit your details — **address is editable**, along with name, mobile, village, email |
| `/auth/forgot` · `/auth/reset` | guests | Admin password recovery: request OTP (stored in PostgreSQL) → set new password |
| `/farmer/dashboard` | farmer | Manage my listings; see buyer interests with contacts |
| `/farmer/listings/new`, `/…/edit`, status toggle, delete | farmer | Full listing CRUD (owner-only) |
| `/buyer/dashboard` | buyer | Saved listings + my interests sent |
| `POST /listings/:id/interest` | buyer | Express interest (farmer sees buyer's contact) |
| `POST /listings/:id/favorite` | buyer | Save/unsave a listing |
| `/admin` | admin | District overview: users, listings, moderation, volume summary |
| `/admin/db` | admin | Database status: SQLite, PostgreSQL, Firebase, realtime clients |
| `/admin/export` | admin | Download all listings as CSV (Excel-friendly, UTF-8 BOM) |

---

## ✨ Features mapped to project goals

1. **Passwordless entry for farmers & buyers** — anyone enters with **name + mobile + address**; the account is created automatically and the details appear in the admin panel. No usernames/passwords for regular users.
2. **Editable profile** — users can change their **address** (and name/mobile/village/email) any time from the ✏️ Edit link; the admin panel always shows the latest details.
3. **Crop listing & management** — farmers create/edit/mark-sold/delete their listings; every listing follows one schema.
4. **Buyer browse, search & filter** — multi-field filter bar + sorting on `GET /listings`.
5. **Price trends (charts)** — `utils/trends.js` aggregates the structured records into weekly averages and volumes; Chart.js renders them on `/trends`.
6. **Buyer dashboard & saved searches** — favorites ("♥") and interest history on `/buyer/dashboard`.
7. **Admin panel** — statistics, user activation/deactivation (deactivated farmers' listings are hidden), listing removal, CSV export; **only the admin logs in with a username + password** (`SURYAS`).
8. **Forgot password (OTP, admin only)** — 6-digit OTP stored in **PostgreSQL**, emailed via SMTP (or shown in demo mode); 10-min expiry, one-time use, max 5 attempts.
9. **Realtime sync (no refresh)** — SSE bus broadcasts every mutation; open tabs update `<main>` in place, charts re-render, live-sync pill confirms.
10. **Firebase-ready** — optional Firebase Realtime DB mirror lights up with two env vars.

---

## 🛠 Tech stack

- **Backend:** Node.js + Express 4
- **Templating:** EJS
- **Data:** SQLite (sql.js, single file) for app data + **embedded PostgreSQL** for forgot-password OTPs
- **Realtime:** Server-Sent Events (`/events`) — no refresh updates
- **Firebase:** optional Firebase-admin Realtime Database mirror
- **Auth:** express-session; farmers/buyers are passwordless (mobile-based), the admin uses username + bcrypt-hashed password
- **Email:** nodemailer + Gmail SMTP (App Password)
- **Charts:** Chart.js (CDN)
- **Styling:** hand-written responsive CSS (no framework)

---

## 🔒 Security notes (demo-level)

- Passwords (admin only) hashed with bcrypt — never stored in plain text; farmers & buyers have no passwords at all.
- Session cookie: `httpOnly`, `sameSite=lax`, 7-day expiry.
- Role-based access control on every protected route; farmers can only edit/delete their own listings.
- OTPs: 6 digits, 10-minute expiry, one-time use, 5-attempt lock, generic forgot-password response (no account disclosure).
- User input is escaped by EJS (`<%= %>`); server-side validation on entry, profile & listing forms.
- `.env` holds secrets and is git-ignored — never commit it.
- For production: use a real DB, HTTPS, a persistent session store, and CSRF protection.

---

## 🧪 Testing

A quick curl-based smoke test against every page, login, CRUD and CSRF-less flow was run during development; all public pages return 200, protected pages return 403 for the wrong role and 302 for guests, invalid credentials return 401, and duplicate emails return 400. Realtime sync was verified end-to-end: an SSE client receives a `sync` event within milliseconds of any mutation, and the shipped `realtime.js` swaps page content without a reload.