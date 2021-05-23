const express = require('express');
const router = express.Router();
const { passportCheckAuthenticated } = require('../../app/middlewares/authJwt');

router.get('/', passportCheckAuthenticated,(req, res) => {
    res.render('home', {user : req.user});
});

module.exports = router;