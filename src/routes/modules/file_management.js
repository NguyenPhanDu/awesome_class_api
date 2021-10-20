const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const FileManagementController = require('../../app/api/controllers/ClassFileManagementController');
const UserPermissionMiddleware = require('../../app/middlewares/userPermission')
//router.use(verifyToken);
router.post('/show-all-file', FileManagementController.showAllFileInClass)
//router.post('/test',bb.limitMemberInClass,FileManagementController.testThoi);

module.exports = router;