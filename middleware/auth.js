// middleware/auth.js
// Session helpers: attaches the logged-in user to every request
// and provides role-guards for farmer / buyer / admin routes.

const db = require('../data/db');

// Populates res.locals.currentUser for every request (used by all templates).
function attachUser(req, res, next) {
  res.locals.currentUser = null;
  if (req.session && req.session.userId) {
    const user = db.findUserById(req.session.userId);
    if (user) {
      res.locals.currentUser = user;
    } else {
      req.session.userId = null;
    }
  }
  next();
}

// Any logged-in user.
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login?msg=Please+log+in+to+continue');
  }
  const user = db.findUserById(req.session.userId);
  if (!user || user.active === false) {
    req.session.userId = null;
    return req.session.destroy
      ? req.session.destroy(() => res.redirect('/auth/login?err=Session+expired'))
      : res.redirect('/auth/login?err=Session+expired');
  }
  req.currentUser = user;
  res.locals.currentUser = user;
  next();
}

// Logged in AND a specific role.
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/auth/login?msg=Please+log+in+to+continue');
    }
    const user = db.findUserById(req.session.userId);
    if (!user) {
      req.session.userId = null;
      return res.redirect('/auth/login?err=Session+expired');
    }
    if (user.active === false) {
      req.session.userId = null;
      return res.redirect('/auth/login?err=Your+account+has+been+deactivated');
    }
    if (user.role !== role) {
      return res.status(403).render('error', {
        title: 'Access denied',
        status: 403,
        message: `This page is available to ${role}s only. You are logged in as a ${user.role}.`,
      });
    }
    req.currentUser = user;
    res.locals.currentUser = user;
    next();
  };
}

const requireFarmer = requireRole('farmer');
const requireBuyer = requireRole('buyer');
const requireAdmin = requireRole('admin');

module.exports = { attachUser, requireLogin, requireFarmer, requireBuyer, requireAdmin };