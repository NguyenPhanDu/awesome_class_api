const express = require('express');
const router = express.Router();
const {verifyToken} = require('../app/middlewares/authJwt');
const UserProfileController = require('../app/api/controllers/UserProfileController');


router.get('/get-user-profile', UserProfileController.getUserProfile);
router.post('/update-user-profile',UserProfileController.updateUserProfile);
module.exports = router;