// utils/mailer.js
// Sends the password-reset OTP email.
//
// Two modes:
//   1. REAL EMAIL — configure SMTP via environment variables:
//        SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=you@gmail.com \
//        SMTP_PASS=<app password> MAIL_FROM="KrishiSetu <you@gmail.com>" npm start
//   2. DEMO MODE — no SMTP config: the OTP is printed to the server console
//      and surfaced on the reset form so the flow can be presented end-to-end.

const config = require('../config');

let transporter = null;
if (config.SMTP.host) {
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: config.SMTP.host,
      port: config.SMTP.port,
      secure: config.SMTP.secure,
      auth: config.SMTP.user
        ? { user: config.SMTP.user, pass: config.SMTP.pass }
        : undefined,
    });
  } catch (err) {
    console.error('SMTP transport could not be created:', err.message);
  }
}

/**
 * @returns {Promise<{demo: boolean, otp: string|null}>}
 */
async function sendOtpEmail({ to, name, otp }) {
  if (transporter) {
    try {
      const html =
        `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:#14532d;color:#fff;padding:18px 24px;font-size:20px;font-weight:bold">🌾 KrishiSetu</div>
          <div style="padding:24px">
            <p>Hello <strong>${name}</strong>,</p>
            <p>We received a request to reset your password. Your one-time code is:</p>
            <p style="font-size:28px;letter-spacing:6px;font-weight:bold;color:#15803d">${otp}</p>
            <p>This code is valid for <strong>10 minutes</strong>. If you did not request it, you can safely ignore this email.</p>
            <p style="color:#6b7280;font-size:12px">— KrishiSetu · Farmer &amp; Crop Listings</p>
          </div>
        </div>`;

      await transporter.sendMail({
        from: config.SMTP.from,
        to,
        subject: 'KrishiSetu — Your password reset OTP',
        text:
          `Hello ${name},\n\n` +
          `Your KrishiSetu password-reset OTP is: ${otp}\n` +
          `It is valid for 10 minutes.\n` +
          `If you did not request this, please ignore this email.\n\n— KrishiSetu`,
        html,
      });
      return { demo: false, otp: null };
    } catch (err) {
      // Email failed (e.g. wrong SMTP password). Fall back to demo mode so
      // the reset flow never dead-ends: the OTP is shown on screen + console.
      console.error('📧 SMTP email failed — falling back to demo mode:', err.message || err);
    }
  }

  // ---- Demo mode (no SMTP configured, or SMTP failed) ----------------
  console.log('');
  console.log('  📧 [DEMO MODE] No SMTP configured — password-reset email for ' + to + ':');
  console.log('  ───────────────────────────────────────────────────────────────');
  console.log('     🔑 Your one-time OTP is:  ' + otp + '   (valid for 10 minutes)');
  console.log('  ───────────────────────────────────────────────────────────────');
  console.log('');
  return { demo: true, otp };
}

module.exports = { sendOtpEmail };