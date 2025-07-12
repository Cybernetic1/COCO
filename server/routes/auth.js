const express = require('express');
const passport = require('passport');
const router = express.Router();

// GET route for login page (for failed authentication redirects)
router.get('/login', (req, res) => {
  res.redirect('/coco.html?error=login_failed');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/my-projects.html',
  failureRedirect: '/login'
}));

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/my-projects.html',
  failureRedirect: '/login'
}));

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/my-projects.html',
  failureRedirect: '/login'
}));

// API: Get user info for frontend
router.get('/user-info', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({
      loggedIn: true,
      name: req.user.name,
      avatar: req.user.avatar
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// Log out route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;