// PM2 process file — run KrishiSetu on a VPS without Docker.
//
//   npm i -g pm2
//   pm2 start ecosystem.config.cjs
//   pm2 save && pm2 startup   # auto-restart on boot / after crashes
//   pm2 logs krishisetu
//
// The forgot-password OTP store uses the embedded PostgreSQL by default;
// set DATABASE_URL in .env to use your own Postgres server instead.
module.exports = {
  apps: [
    {
      name: 'krishisetu',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '300M',
      time: true,
      autorestart: true,
      kill_timeout: 8000,
    },
  ],
};