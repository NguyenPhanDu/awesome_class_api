const express = require('express');
const router = express.Router();
const passport = require('passport');

const initPassportLocal = require('../../config/passport');
const loginController = require('../../app/controllers/LoginController');
const { passportCheckNotAuthenticated } = require('../../app/middlewares/authJwt');

initPassportLocal();

router.get('/login', passportCheckNotAuthenticated, loginController.getLogin);

router.post('/login', passport.authenticate('local',{
    failureRedirect: "/admin/login",
    successRedirect: '/admin',
    failureFlash: true
}));

router.get('/logout', loginController.logOut);

module.exports = router;