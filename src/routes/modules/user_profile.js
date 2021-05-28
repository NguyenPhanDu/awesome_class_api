const express = require('express');
const router = express.Router();

const {verifyToken} = require('../../app/middlewares/authJwt');
const UserProfileController = require('../../app/api/controllers/UserProfileController');

router.post('/get-user-profile', UserProfileController.getUserProfile);
router.post('/update-user-profile',UserProfileController.updateUserProfile);
router.post('/update-avatar', UserProfileController.updateAvatar);
router.post('/update-avatar', UserProfileController.updateAvatar);
module.exports = router;