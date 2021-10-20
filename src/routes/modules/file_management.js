const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const FileManagementController = require('../../app/api/controllers/ClassFileManagementController');

//router.use(verifyToken);
router.post('/test',FileManagementController.testThoi);

module.exports = router;