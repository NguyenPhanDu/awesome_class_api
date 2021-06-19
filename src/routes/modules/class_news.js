const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const ClassNewsController = require('../../app/api/controllers/ClassNewsController');
const upload = require('../../app/middlewares/upload');
router.use(verifyToken);
router.post('/get-detail',ClassNewsController.getDetailNews);
router.post('/create', upload, ClassNewsController.create);
router.post('/update', upload, ClassNewsController.update);
router.post('/delete',ClassNewsController.delete);

module.exports = router