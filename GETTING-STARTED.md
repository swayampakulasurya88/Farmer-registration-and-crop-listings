# KrishiSetu — Download & Get Started

Everything you need to download, install, run, and deploy **KrishiSetu** (farmer & crop listings, EN/తె/हि).

---

## 1. What to download

### Option A — Source-only ZIP (recommended for deployment)
- File: **`releases/krishisetu-deploy.zip`** (in this repo — GitHub web UI → open it → ⤓ Download, or direct raw link below)
- Contents: full project source + deployment files (`Dockerfile`, `docker-compose.yml`, `render.yaml`, `ecosystem.config.cjs`, `.env.example`, docs). **No `node_modules`** — dependencies install on the target machine/platform.
- Use it on: Render, Railway, VPS, or your own computer (run `npm install` after unzipping).

### Option B — Full offline bundle (Linux x64 only)
- File: served at `http://localhost:3000/krishisetu-full.zip` on the dev machine
- Contents: source + **all npm dependencies pre-installed** (includes the Linux-x64 embedded PostgreSQL binary). Unzip → `npm start` → done, no internet needed.
- **Important:** the pre-installed dependencies are for **Linux x64**. On Windows/macOS use Option A and run `npm install` (npm downloads the correct PostgreSQL binary for your OS automatically).

### Prerequisites you download separately
| What | Where | Needed for |
|---|---|---|
| **Node.js 20 LTS** (or newer) | https://nodejs.org | Running the app |
| **Git** (optional) | https://git-scm.com | Cloning the repo |
| **Docker Desktop** (optional) | https://www.docker.com | `docker-compose up` |
| **Render / Railway account** (optional) | render.com / railway.app | One-click deploy |

---

## 2. Run it locally

```bash
# Option A:
unzip krishisetu-deploy.zip
cd krishisetu-deploy
npm install
npm start            # → http://localhost:3000

# Option B (Linux x64 only):
unzip krishisetu-full.zip
cd krishisetu-full
npm start            # → http://localhost:3000
```

First run auto-seeds demo data (farmers, buyers, listings, prices).
Login without a password: **Farmer** — name `Ramesh Chandra`, mobile `9876512341`, village `Andipalem`. **Admin** — username `SURYAS`, password `SURYAS2007`.

### Configuration (all optional — sensible defaults)
Copy `.env.example` to `.env` and set what you need:

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | HTTP port | `3000` |
| `SESSION_SECRET` | Session signing key (set a long random value) | random each start |
| `SMTP_HOST/EMAIL/PASS` | Real OTP emails (e.g. Gmail App Password); unset = **demo mode**, OTP shown on screen | demo mode |
| `DATA_DIR` | Where SQLite DB + embedded PostgreSQL live (volume mount on servers) | `./data` |
| `PG_PORT` | Embedded PostgreSQL port | `5433` |

---

## 3. Deploy

Full step-by-step for every platform: **`DEPLOY.md`** (Render blueprint, Railway, Fly.io, VPS/Docker, PM2).

Quickest — **Render** (from this GitHub repo):
1. Create account → **New + → Blueprint** → pick this repo (or upload the zip).
2. Render finds `render.yaml` and builds the web service automatically.
3. Add a `SESSION_SECRET` env var. Free tier: remove the `disk:` block (data resets on redeploy). Paid: keep the persistent disk at `/app/data`.
4. Deploy → done. First boot seeds demo data.

**Also on Railway** (just as easy): `railway.json` is included → railway.app → **New Project → Deploy from GitHub repo** → **Generate Domain**. Mount a volume at `/app/data` so data survives redeploys. See `DEPLOY.md` §2.

---

## 4. Sanity check after any install

```bash
node server.js
# then:
curl -s http://localhost:3000/api/status   # → 200 JSON with DB + OTP store state
curl -sI http://localhost:3000/listings?lang=te   # → 200 (Telugu UI)
```

---

## 5. Troubleshooting

| Symptom | Fix |
|---|---|
| `npm install` fails with "Unsupported platform" | You have an old lockfile; delete `package-lock.json` + `node_modules`, re-run `npm install` |
| OTP email never arrives | SMTP unset → demo mode (OTP printed on screen/console) |
| Port already in use | `PORT=3100 npm start` |
| 404 on `/auth/logout` via GET | Logout is a POST form by design (CSRF-safe) — use the header button |
| Data lost on redeploy (Render free) | Free tier has no persistent disk — use paid tier or Railway |