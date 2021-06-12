const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const NewFeedController = require('../../app/api/controllers/NewFeedController');
router.post('/',NewFeedController.showNewFeed);
module.exports = router