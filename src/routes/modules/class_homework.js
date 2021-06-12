const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const ClassHomeworkController = require('../../app/api/controllers/ClassHomeworkController');

router.use(verifyToken);
router.post('/',ClassHomeworkController.getAllClassOfUserInClass);
//router.post('/test',ClassHomeworkController.getAllClassOfUserInClass);
module.exports = router;