-- database/schema.sql
-- KrishiSetu — PostgreSQL schema.
--
-- PostgreSQL is used as the durable store for the forgot-password OTP flow
-- (table: password_reset_otps). The same schema below also mirrors the full
-- application data model (users / listings / interests / favorites), so the
-- whole platform can be lifted onto Postgres later without redesign.
--
-- The embedded PostgreSQL server (see database/pg.js) applies this schema
-- automatically on first boot. Requires nothing more than `npm install`.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT,
  username      TEXT,
  passwordHash  TEXT,
  role          TEXT NOT NULL,            -- 'farmer' | 'buyer' | 'admin'
  village       TEXT,
  phone         TEXT,
  address       TEXT,
  landSize      TEXT,
  businessType  TEXT,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS listings (
  id            TEXT PRIMARY KEY,
  farmerId      TEXT NOT NULL REFERENCES users(id),
  farmerName    TEXT NOT NULL,
  crop          TEXT NOT NULL,
  variety       TEXT,
  quantity      NUMERIC NOT NULL,
  unit          TEXT NOT NULL,
  price         NUMERIC NOT NULL,
  priceUnit     TEXT NOT NULL,
  quality       TEXT,
  location      TEXT,
  district      TEXT,
  status        TEXT NOT NULL DEFAULT 'active',   -- 'active' | 'sold'
  harvestDate   DATE,
  availableDate DATE,
  notes         TEXT,
  createdAt     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS interests (
  id          TEXT PRIMARY KEY,
  listingId   TEXT NOT NULL REFERENCES listings(id),
  buyerId     TEXT NOT NULL REFERENCES users(id),
  message     TEXT,
  createdAt   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorites (
  id          TEXT PRIMARY KEY,
  buyerId     TEXT NOT NULL REFERENCES users(id),
  listingId   TEXT NOT NULL REFERENCES listings(id),
  createdAt   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Forgot-password OTP records (the PostgreSQL-backed piece).
CREATE TABLE IF NOT EXISTS password_reset_otps (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  email       TEXT NOT NULL,
  otp         TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_user      ON password_reset_otps (user_id);
CREATE INDEX IF NOT EXISTS idx_otp_expires   ON password_reset_otps (expires_at);
CREATE INDEX IF NOT EXISTS idx_listings_farmer ON listings (farmerId);
CREATE INDEX IF NOT EXISTS idx_interests_listing ON interests (listingId);
CREATE INDEX IF NOT EXISTS idx_favorites_buyer   ON favorites (buyerId);