const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const ClassNotificationController = require('../../app/api/controllers/ClassNotificationController');

router.use(verifyToken);
router.post('/',ClassNotificationController.getAllNotifyInClass);
router.post('/get-detail',ClassNotificationController.getDetailNotify);
router.post('/create',ClassNotificationController.create);
router.post('/update',ClassNotificationController.update);
router.post('/delete',ClassNotificationController.delete);

module.exports = router