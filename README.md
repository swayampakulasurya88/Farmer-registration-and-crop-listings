# 🌾 KrishiSetu — Farmer Registration & Crop Listings

> **A district-level shared, structured record of crop availability and prices — connecting farmers and buyers directly, with no middlemen.**

KrishiSetu is a complete web platform where:

- **Farmers** register and post structured crop listings (crop, variety, quantity, price, quality, harvest/availability dates, pickup village).
- **Buyers** (wholesalers, retailers, traders, FPOs) search, filter and compare listings across the whole district, save favourites, and express interest — the farmer then sees their contact details.
- **Admins** get a district overview: users, listings, interests, price/volume summaries, moderation controls, and a **CSV export** for reporting.

Because every listing follows the *same fields*, the records become **searchable, filterable and analyzable** — that's the "structured record" at the heart of the project.

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

### Demo accounts

| Role   | Email                  | Password    |
|--------|------------------------|-------------|
| Admin  | admin@krishisetu.gov   | admin123    |
| Farmer | ramesh@demo.in         | farmer123   |
| Buyer  | buyer@demo.in          | buyer123    |

---

## 📁 Project structure (file-by-file)

```
Farmerregistrationandcroplistings/
│
├── server.js                 # Entry point — starts the HTTP server (npm start)
├── app.js                    # Express app: middleware, sessions, route mounting, error handling
├── config.js                 # District config: name, villages, crops, units, qualities, emojis
├── seed.js                   # Demo-data generator (`npm run seed`) + auto-seed on first run
├── package.json              # Dependencies & scripts
│
├── data/
│   ├── db.js                 # JSON-file database layer (users, listings, interests, favorites)
│   └── store.json            # The actual data (auto-created / seeded — git-ignored)
│
├── middleware/
│   └── auth.js               # attachUser + role guards (requireFarmer/Buyer/Admin)
│
├── routes/
│   ├── authRoutes.js         # Register, login, logout (bcrypt password hashing)
│   ├── listingRoutes.js      # Home page, browse+filter, listing detail, price trends
│   ├── farmerRoutes.js       # Farmer dashboard + crop-listing CRUD (create/edit/sold/delete)
│   ├── buyerRoutes.js        # Buyer dashboard, saved listings, express interest
│   └── adminRoutes.js        # Admin panel, moderation, CSV export
│
├── utils/
│   ├── format.js             # ₹ formatting, quantity → kg conversion, date helpers
│   └── trends.js             # Weekly price series, volume aggregation, price-movement tables
│
├── views/                    # EJS templates
│   ├── partials/
│   │   ├── header.ejs        # <head>, nav bar, flash alerts
│   │   ├── footer.ejs        # footer + scripts
│   │   ├── alerts.ejs        # success/error toasts
│   │   └── listingCard.ejs   # reusable crop-listing card
│   ├── index.ejs             # Landing: hero, stats, how-it-works, recent listings, price snapshot
│   ├── trends.ejs            # Price charts page (Chart.js)
│   ├── error.ejs             # 403/404/500 pages
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs      # role picker (farmer/buyer) with conditional fields
│   ├── listings/
│   │   ├── browse.ejs        # search + filter bar + results grid
│   │   └── detail.ejs        # full structured record + contact/interest sidebar
│   ├── farmer/
│   │   ├── dashboard.ejs     # my listings + buyer interests received
│   │   └── listingForm.ejs   # add/edit listing form
│   ├── buyer/
│   │   └── dashboard.ejs     # saved listings + interests sent
│   └── admin/
│       └── dashboard.ejs     # stats, user & listing moderation, export button
│
└── public/                   # static assets
    ├── css/style.css         # full responsive stylesheet
    └── js/
        ├── main.js           # nav toggle, confirm dialogs, role toggle, toasts
        └── charts.js         # renders the Chart.js price/volume charts
```

---

## 🧭 Pages & routes

| URL | Who | Purpose |
|-----|-----|---------|
| `/` | everyone | Landing page with district stats, recent listings, price snapshot |
| `/listings` | everyone | Browse + filter (search, crop, village, quality, min/max price, sorting) |
| `/listings/:id` | everyone | Full structured record; contact + interest for logged-in users |
| `/trends` | everyone | Weekly price charts (₹/kg) and volume bar chart, live-computed |
| `/auth/register` · `/auth/login` | guests | Farmer/buyer registration & login |
| `/farmer/dashboard` | farmer | Manage my listings; see buyer interests with contacts |
| `/farmer/listings/new`, `/…/edit`, status toggle, delete | farmer | Full listing CRUD (owner-only) |
| `/buyer/dashboard` | buyer | Saved listings + my interests sent |
| `POST /listings/:id/interest` | buyer | Express interest (farmer sees buyer's contact) |
| `POST /listings/:id/favorite` | buyer | Save/unsave a listing |
| `/admin` | admin | District overview: users, listings, moderation, volume summary |
| `/admin/export` | admin | Download all listings as CSV (Excel-friendly, UTF-8 BOM) |

---

## ✨ Features mapped to project goals

1. **Farmer registration & login** — `authRoutes.js`, `data/db.js`, bcrypt-hashed passwords, sessions.
2. **Crop listing & management** — farmers create/edit/mark-sold/delete their listings; every listing follows one schema.
3. **Buyer browse, search & filter** — multi-field filter bar + sorting on `GET /listings`.
4. **Price trends (charts)** — `utils/trends.js` aggregates the structured records into weekly averages and volumes; Chart.js renders them on `/trends`.
5. **Buyer dashboard & saved searches** — favorites ("♥") and interest history on `/buyer/dashboard`.
6. **Admin panel** — statistics, user activation/deactivation (deactivated farmers' listings are hidden), listing removal, CSV export.

---

## 🛠 Tech stack

- **Backend:** Node.js + Express 4
- **Templating:** EJS
- **Data:** JSON-file store (`data/store.json`) — zero database setup; swap `data/db.js` for MongoDB/MySQL later without touching routes
- **Auth:** express-session + bcryptjs (password hashing)
- **Charts:** Chart.js (CDN)
- **Styling:** hand-written responsive CSS (no framework)

---

## 🔒 Security notes (demo-level)

- Passwords hashed with bcrypt (never stored in plain text).
- Session cookie: `httpOnly`, `sameSite=lax`, 7-day expiry.
- Role-based access control on every protected route; farmers can only edit/delete their own listings.
- User input is escaped by EJS (`<%= %>`); server-side validation on register & listing forms.
- For production: use a real DB, HTTPS, a persistent session store, and CSRF protection.

---

## 🧪 Testing

A quick curl-based smoke test against every page, login, CRUD and CSRF-less flow was run during development; all public pages return 200, protected pages return 403 for the wrong role and 302 for guests, invalid credentials return 401, and duplicate emails return 400.