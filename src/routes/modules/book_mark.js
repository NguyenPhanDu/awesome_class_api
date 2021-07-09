const express = require('express');
const router = express.Router();
const BookmarkController = require('../../app/api/controllers/BookmarkController');
const {verifyToken} = require('../../app/middlewares/authJwt');

router.use(verifyToken);
router.post('/add-favourate', BookmarkController.addFavourate);
router.post('/remove-favourate', BookmarkController.removeFavourate);

module.exports = router;