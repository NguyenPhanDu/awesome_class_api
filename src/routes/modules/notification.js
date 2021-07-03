const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const NotificationController = require('../../app/api/controllers/NotificationController')
router.use(verifyToken);
router.post('/',NotificationController.getAllNotifyOfUser);
module.exports = router