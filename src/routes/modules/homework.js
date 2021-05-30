const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const HomeWorkController = require('../../app/api/controllers/HomeworkController');

router.use(verifyToken);
router.post('/create-normal-homework', HomeWorkController.createNormalHomework);
router.post('/delete-homework', HomeWorkController.deleteHomework);

module.exports = router;