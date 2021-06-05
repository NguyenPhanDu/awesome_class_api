const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const HomeWorkController = require('../../app/api/controllers/HomeworkController');
const upload = require('../../app/middlewares/upload');
router.use(verifyToken);
router.post('/create-normal-homework',upload, HomeWorkController.createNormalHomework);
router.post('/delete-homework', HomeWorkController.deleteHomework);
router.post('/get-detail-homework',HomeWorkController.getDetailHomework);

module.exports = router;