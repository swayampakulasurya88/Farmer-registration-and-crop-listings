# Deploying KrishiSetu

The app is a single Node.js service (Express + EJS) with:

| Data | Store | Where it must persist |
|---|---|---|
| Farmers, buyers, listings, interests | SQLite file `data/krishisetu.sqlite` | a **volume / persistent disk** named `DATA_DIR` |
| Forgot-password OTPs | PostgreSQL (`DATABASE_URL`) or embedded cluster | a Postgres service / `data/pg` volume |
| Login sessions | in memory | resets on restart (fine for a demo) |

`data/` and `.env` are never committed — the database seeds itself with demo
data on first boot.

## 1. VPS / any Linux server with Docker (recommended — fully persistent)

```bash
git clone git@github.com:swayampakulasurya88/Farmer-registration-and-crop-listings.git
cd Farmer-registration-and-crop-listings
cp .env.example .env        # edit SESSION_SECRET, SMTP, PG_PASS, DISTRICT…
docker compose up -d --build
curl -s http://localhost:3000/api/status | head -c 200   # health check
docker compose logs -f web                               # app logs
```

* Site: `http://<server-ip>:3000` — open the port in your firewall
  (`ufw allow 3000/tcp`) or front it with Nginx + a domain on 443.
* Both SQLite (`appdata`) and Postgres (`pgdata`) are named volumes →
  `docker compose down` keeps the data; `docker compose down -v` wipes it.
* Update: `git pull && docker compose up -d --build`.
* Embedded-Postgres fallback: run a single container instead —
  `docker run -d -p 3000:3000 -v ks-data:/app/data krishisetu` (no compose).

## 2. Railway (auto-deploy from GitHub, ~5 min)

1. Push this repo to GitHub (already configured as `origin`).
2. [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
   Railway detects the `Dockerfile` and builds it.
3. Add plugins/services:
   * **PostgreSQL** → Railway injects `DATABASE_URL` automatically (OTP store).
   * **Volume** → mount it at `/app/data` (persists the SQLite database).
4. **Settings → Networking → Generate Domain** → public HTTPS URL.
5. Set env vars: `SESSION_SECRET` (random hex), `DISTRICT`, optional `SMTP_*`.

Restart-safe: sessions reset on redeploy; the SQLite database and Postgres do not.

## 3. Render (from GitHub — Blueprint, ~5 min)

Render reads the included `render.yaml` blueprint, so there is nothing to
configure by hand:

1. Push the repo to GitHub (already `origin`).
2. [render.com](https://render.com) → **New → Blueprint**.
3. Pick this repo → Render creates the `krishisetu` web service and deploys
   the `Dockerfile` automatically, then gives you a public URL.
4. Data: the blueprint mounts a **persistent disk at `/app/data`** (both the
   SQLite database and the embedded PostgreSQL OTP store live there). Disks
   need a **paid plan** — on the free tier remove the `disk:` block from
   `render.yaml`; the site still works but data resets when the service
   sleeps / redeploys (demo data re-seeds).
5. Optional: to use Render's managed PostgreSQL instead of the embedded
   cluster, uncomment the `databases:` block in `render.yaml` and add the
   `DATABASE_URL` env var from it. Note: free-tier Render Postgres expires
   after 30 days.

Manual (no blueprint): New → **Web Service** → repo → Runtime **Docker** →
Health Check Path `/api/status` → Create. Add a persistent disk at `/app/data`.

## 4. Fly.io (Docker + volume)

```bash
fly launch --now                 # detects the Dockerfile
fly volumes create ks_data --size 1 --region <near-you>
fly volumes append ks_data --app <app-name>
fly secrets set SESSION_SECRET=$(openssl rand -hex 32)
fly status                        # public URL + health
```
Mount the volume at `/app/data`; set `DATABASE_URL` via `fly postgres create`
or keep the embedded cluster.

## 5. VPS without Docker (PM2)

```bash
sudo apt install -y nginx
git clone <repo> && cd Farmer-registration-and-crop-listings
npm ci
cp .env.example .env              # edit secrets
npm i -g pm2
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup           # survive reboots
```
Proxy Nginx to `127.0.0.1:3000` and add SSL with `certbot --nginx`.

## Post-deploy checklist

```bash
curl -s http://<host>:3000/api/status          # db + postgres health (200)
curl -sI http://<host>:3000/?lang=te           # language switch + Set-Cookie
curl -s http://<host>:3000/auth/login          # 200, entry page renders
```

* **SMTP**: leave `SMTP_HOST` empty for demo mode (OTP shown on screen and in
  logs). Fill `SMTP_*` with a Gmail App Password for real OTP emails.
* **District**: change `DISTRICT`, `STATE` (and villages in `config.js`) to
  brand the platform for another district.
* **Sessions** are in-memory: users log in again after a restart. For a
  multi-instance/production setup, swap to a shared session store
  (e.g. `connect-pg-simple` on the same Postgres).
* **Backups**: copy the `appdata` volume (one file: `krishisetu.sqlite`)
  — `docker compose exec web node -e "fetch"` is not needed; the file is
  written synchronously on every change, so a plain `cp` is consistent:
  `docker run --rm -v <proj>_appdata:/d -v $PWD:/b alpine cp /d/krishisetu.sqlite /b/backup-$(date +%F).sqlite`