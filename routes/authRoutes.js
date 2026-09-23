// routes/authRoutes.js
// Entry & login:
//   * Farmers / buyers enter with name + mobile + address — no username,
//     no password. First time = account created automatically; returning =
//     recognised by mobile number.
//   * ONLY the admin keeps a username + password login (SURYAS / SURYAS2007).
// Also: editable profile (address is changeable any time), OTP password
// recovery (admin account only) and logout.

const express = require('express');
const bcrypt = require('bcryptjs');

const db = require('../data/db');
const { VILLAGES, BUSINESS_TYPES } = require('../config');
const { generate: genOtp, verify: verifyOtp, OTP_TTL_MS } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/mailer');
const bus = require('../utils/bus');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

/* --------------------------- Login / entry -------------------------- */

router.get('/auth/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/login', {
    title: 'Enter KrishiSetu',
    villages: VILLAGES,
    businessTypes: BUSINESS_TYPES,
    tab: req.query.tab === 'admin' ? 'admin' : 'user',
    form: {},
    fieldErrors: {},
  });
});

// Registration is now part of "enter": a new name+mobile+address simply
// creates the account. Kept as a redirect so old links still work.
router.get('/auth/register', (req, res) => res.redirect('/auth/login'));
router.post('/auth/register', (req, res) => res.redirect('/auth/login'));

function loginAs(req, res, user, message) {
  req.session.userId = user.id;
  const homes = { farmer: '/farmer/dashboard', buyer: '/buyer/dashboard', admin: '/admin' };
  return res.redirect((homes[user.role] || '/') + '?msg=' + encodeURIComponent(message));
}

router.post('/auth/login', (req, res) => {
  const { tab } = req.body;
  const renderLogin = (status, form, fieldErrors) =>
    res.status(status).render('auth/login', {
      title: 'Enter KrishiSetu',
      villages: VILLAGES,
      businessTypes: BUSINESS_TYPES,
      tab: tab === 'admin' ? 'admin' : 'user',
      form,
      fieldErrors,
    });

  /* -------- Admin: username + password (the only password login) -------- */
  if (tab === 'admin') {
    const { login, password } = req.body;
    const user = db.findUserByLogin(login);

    if (!user) return renderLogin(401, { login }, { login: 'Invalid username or password.' });
    if (user.role !== 'admin') {
      return renderLogin(401, { login }, { login: 'Admin login is only for the administrator.' });
    }
    if (!bcrypt.compareSync(password || '', user.passwordHash || '')) {
      return renderLogin(401, { login }, { login: 'Invalid username or password.' });
    }
    if (user.active === false) {
      return renderLogin(403, { login }, { login: 'This admin account has been deactivated.' });
    }
    return loginAs(req, res, user, 'Welcome back, ' + user.name.split(' ')[0] + '!');
  }

  /* -------- Farmers & buyers: enter with name + mobile + address -------- */
  const { name, phone, village, address, role, landSize, businessType } = req.body;

  const fieldErrors = {};
  if (!name || name.trim().length < 2) fieldErrors.name = 'Please enter your full name.';
  if (!phone || !/^[0-9+\-\s]{10,15}$/.test(phone)) fieldErrors.phone = 'Enter a valid mobile number.';
  if (role && !['farmer', 'buyer'].includes(role)) fieldErrors.role = 'Choose a role.';
  if (village && !VILLAGES.includes(village)) fieldErrors.village = 'Choose your village from the list.';

  if (Object.keys(fieldErrors).length) {
    return renderLogin(400, { name, phone, village, address, role, landSize, businessType }, fieldErrors);
  }

  // Returning user — recognised by mobile number, no password needed.
  const existing = db.findUserByMobile(phone.trim());
  if (existing) {
    if (existing.active === false) {
      return renderLogin(
        403,
        { name, phone, village },
        { phone: 'This account has been deactivated. Contact the district administrator.' }
      );
    }
    return loginAs(req, res, existing, 'Welcome back, ' + existing.name.split(' ')[0] + '!');
  }

  // First time — the account is created automatically and details (including
  // the address) show up in the admin panel. Only now do the optional
  // address details get validated.
  if (address && address.trim() && address.trim().length < 3) fieldErrors.address = 'Address looks too short.';
  if (Object.keys(fieldErrors).length) {
    return renderLogin(400, { name, phone, village, address, role, landSize, businessType }, fieldErrors);
  }

  const userRole = role === 'buyer' ? 'buyer' : 'farmer';
  const user = db.addUser({
    name: name.trim(),
    phone: phone.trim(),
    village: village || null,
    address: (address || '').trim() || null,
    role: userRole,
    landSize: userRole === 'farmer' && landSize ? landSize.trim() : null,
    businessType: userRole === 'buyer' && businessType ? businessType : null,
  });
  bus.broadcast('users', { userId: user.id, role: user.role });

  return loginAs(req, res, user, 'Welcome to KrishiSetu, ' + user.name.split(' ')[0] + '! Your account was created.');
});

/* --------------------------- Editable profile ----------------------- */

router.get('/auth/profile', requireLogin, (req, res) => {
  res.render('profile', {
    title: 'Edit your details',
    villages: VILLAGES,
    businessTypes: BUSINESS_TYPES,
    form: req.currentUser,
    fieldErrors: {},
  });
});

router.post('/auth/profile', requireLogin, (req, res) => {
  const { name, phone, village, address, email, landSize, businessType } = req.body;

  const fieldErrors = {};
  if (!name || name.trim().length < 2) fieldErrors.name = 'Please enter your full name.';
  if (!phone || !/^[0-9+\-\s]{10,15}$/.test(phone)) fieldErrors.phone = 'Enter a valid mobile number.';
  if (address && address.trim() && address.trim().length < 3) fieldErrors.address = 'Address looks too short.';
  if (email && !/^\S+@\S+\.\S+$/.test(email)) fieldErrors.email = 'Enter a valid email address, or leave it blank.';
  if (village && !VILLAGES.includes(village)) fieldErrors.village = 'Choose your village from the list.';

  // Mobile is the identity key — must stay unique.
  const clash = db.findUserByMobile(phone.trim());
  if (clash && clash.id !== req.currentUser.id) {
    fieldErrors.phone = 'That mobile number is already registered to someone else.';
  }

  if (Object.keys(fieldErrors).length) {
    return res.status(400).render('profile', {
      title: 'Edit your details',
      villages: VILLAGES,
      businessTypes: BUSINESS_TYPES,
      form: { ...req.currentUser, name, phone, village, address, email, landSize, businessType },
      fieldErrors,
    });
  }

  const patch = {
    name: name.trim(),
    phone: phone.trim(),
    village: village || null,
    address: (address || '').trim() || null,
    email: email ? email.trim().toLowerCase() : null,
  };
  if (req.currentUser.role === 'farmer') patch.landSize = landSize ? landSize.trim() : null;
  if (req.currentUser.role === 'buyer') patch.businessType = businessType || null;

  db.updateUser(req.currentUser.id, patch);
  bus.broadcast('users', { userId: req.currentUser.id });

  res.redirect('/auth/profile?msg=' + encodeURIComponent('Your details were updated — including your address ✓'));
});

/* ----------------------------- Logout ------------------------------ */

router.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('krishisetu.sid');
    res.redirect('/?msg=You+have+been+logged+out');
  });
});

/* ------------------- Forgot password (admin only) ------------------ */
// Only the admin account holds a password, so OTP recovery applies to it.

router.get('/auth/forgot', (req, res) => {
  res.render('auth/forgot', {
    title: 'Admin password recovery',
    form: {},
    fieldErrors: {},
    sent: false,
    demoOtp: null,
  });
});

router.post('/auth/forgot', async (req, res) => {
  const { login } = req.body;
  try {
    const user = db.findUserByLogin(login);
    let demoOtp = null;

    // Non-admin / passwordless accounts (farmers & buyers) can't recover —
    // they have no password. The generic message never reveals that.
    if (user && user.passwordHash) {
      const otp = await genOtp(user.id, user.email);
      const result = await sendOtpEmail({ to: user.email, name: user.name, otp });
      if (result.demo) {
        req.session.demoOtp = String(otp);
        demoOtp = String(otp);
      }
    }

    res.render('auth/forgot', {
      title: 'Admin password recovery',
      form: { login },
      fieldErrors: {},
      sent: true,
      info: user && user.passwordHash
        ? demoOtp
          ? 'Could not reach the email server, so your one-time code is shown below instead.'
          : `An OTP has been sent to the email registered for ${login}.`
        : `If an admin account exists for ${login}, an OTP email has been sent.`,
      demoOtp,
    });
  } catch (err) {
    console.error('OTP email failed:', err);
    res.status(500).render('auth/forgot', {
      title: 'Admin password recovery',
      form: { login },
      fieldErrors: { login: 'Could not send the OTP email. Please try again.' },
      sent: false,
      demoOtp: null,
    });
  }
});

/* --------------------------- Reset password ------------------------ */

router.get('/auth/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Reset admin password',
    form: { login: '' },
    fieldErrors: {},
    demoOtp: req.session.demoOtp || null,
    otpTtlMin: OTP_TTL_MS / 60000,
  });
});

router.post('/auth/reset', async (req, res) => {
  const { login, otp, password, confirm } = req.body;
  const fieldErrors = {};

  const user = db.findUserByLogin(login);
  if (!user) {
    fieldErrors.login = 'No admin account found with that email or username.';
  } else if (!user.passwordHash) {
    fieldErrors.login = 'Password recovery is only for the admin account.';
  } else {
    const check = await verifyOtp(user.id, otp);
    if (!check.ok) {
      fieldErrors.otp =
        check.reason === 'locked'
          ? 'Too many wrong attempts. Please request a new OTP.'
          : 'Invalid or expired OTP. Please request a new one.';
    }
  }

  if (!password || password.length < 6) fieldErrors.password = 'Password must be at least 6 characters.';
  else if (password !== confirm) fieldErrors.password = 'Passwords do not match.';

  if (Object.keys(fieldErrors).length) {
    return res.status(400).render('auth/reset', {
      title: 'Reset admin password',
      form: { login },
      fieldErrors,
      demoOtp: req.session.demoOtp || null,
      otpTtlMin: OTP_TTL_MS / 60000,
    });
  }

  db.updateUser(user.id, { passwordHash: bcrypt.hashSync(password, 10) });
  req.session.demoOtp = null;

  res.redirect('/auth/login?tab=admin&msg=' + encodeURIComponent('Password updated! Login with your new password.'));
});

module.exports = router;