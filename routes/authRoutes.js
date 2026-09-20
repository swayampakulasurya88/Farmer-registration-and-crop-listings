// routes/authRoutes.js
// Registration, login and logout for farmers, buyers and admins.

const express = require('express');
const bcrypt = require('bcryptjs');

const db = require('../data/db');
const { VILLAGES, BUSINESS_TYPES } = require('../config');

const router = express.Router();

/* --------------------------- Register ------------------------------ */

router.get('/auth/register', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/register', {
    title: 'Create an account',
    villages: VILLAGES,
    businessTypes: BUSINESS_TYPES,
    form: {},
    fieldErrors: {},
  });
});

router.post('/auth/register', (req, res) => {
  const { name, email, phone, password, role, village, landSize, businessType } = req.body;

  const fieldErrors = {};
  if (!name || name.trim().length < 2) fieldErrors.name = 'Please enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(email || '')) fieldErrors.email = 'Enter a valid email address.';
  if (!phone || !/^[0-9+\-\s]{10,15}$/.test(phone)) fieldErrors.phone = 'Enter a valid phone number.';
  if (!password || password.length < 6) fieldErrors.password = 'Password must be at least 6 characters.';
  if (!['farmer', 'buyer'].includes(role)) fieldErrors.role = 'Choose a role.';
  if (!VILLAGES.includes(village)) fieldErrors.village = 'Choose your village from the list.';
  if (role === 'farmer' && !landSize) fieldErrors.landSize = 'Enter your land size.';
  if (role === 'buyer' && !businessType) fieldErrors.businessType = 'Select your business type.';

  if (db.findUserByEmail(email)) fieldErrors.email = 'An account with this email already exists.';

  if (Object.keys(fieldErrors).length) {
    return res.status(400).render('auth/register', {
      title: 'Create an account',
      villages: VILLAGES,
      businessTypes: BUSINESS_TYPES,
      form: { name, email, phone, role, village, landSize, businessType },
      fieldErrors,
    });
  }

  const user = db.addUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    village,
    landSize: role === 'farmer' ? landSize.trim() : null,
    businessType: role === 'buyer' ? businessType : null,
  });

  req.session.userId = user.id;

  const home = role === 'farmer' ? '/farmer/dashboard' : '/listings';
  return res.redirect(home + '?msg=Welcome+to+KrishiSetu,+' + encodeURIComponent(user.name.split(' ')[0]) + '!');
});

/* ----------------------------- Login ------------------------------- */

router.get('/auth/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/login', { title: 'Login', form: {}, fieldErrors: {} });
});

router.post('/auth/login', (req, res) => {
  const { login, password } = req.body;
  const user = db.findUserByLogin(login);

  const fail = () =>
    res.status(401).render('auth/login', {
      title: 'Login',
      form: { login },
      fieldErrors: { login: 'Invalid login or password.' },
    });

  if (!user) return fail();
  if (!bcrypt.compareSync(password || '', user.passwordHash)) return fail();
  if (user.active === false) {
    return res.status(403).render('auth/login', {
      title: 'Login',
      form: { login },
      fieldErrors: { login: 'Your account has been deactivated. Contact the district administrator.' },
    });
  }

  req.session.userId = user.id;

  const homes = {
    farmer: '/farmer/dashboard',
    buyer: '/buyer/dashboard',
    admin: '/admin',
  };
  return res.redirect((homes[user.role] || '/') + '?msg=' + encodeURIComponent('Welcome back, ' + user.name.split(' ')[0] + '!'));
});

/* ----------------------------- Logout ------------------------------ */

router.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('krishisetu.sid');
    res.redirect('/?msg=You+have+been+logged+out');
  });
});

module.exports = router;