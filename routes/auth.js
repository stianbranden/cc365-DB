const router= require('express').Router();
const passport = require('passport');
const {ensureAuth, ensureGuest} = require('../middleware/auth');


router.get('/azure/login', ensureGuest, passport.authenticate('azure_ad_oauth2', {scope: ['profile']}));

router.get('/redirect', passport.authenticate('azure_ad_oauth2'),
function (req, res) {
  // Successful authentication, redirect home.
  if ( req.user.ui === 'new') res.redirect('/vue')
  else res.redirect('/')
});

router.get('/logout', ensureAuth, (req, res)=>{
  req.logout();
  res.redirect('/');
})

module.exports = router;