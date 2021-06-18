const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const ClassNewsController = require('../../app/api/controllers/ClassNewsController');

router.use(verifyToken);
router.post('/get-detail',ClassNewsController.getDetailNews);
router.post('/create',ClassNewsController.create);
router.post('/update',ClassNewsController.update);
router.post('/delete',ClassNewsController.delete);

module.exports = router