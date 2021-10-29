const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const UserPermissionMiddleware = require('../../app/middlewares/userPermission')
const ClassController = require('../../app/api/controllers/ClassController');

router.use(verifyToken);
router.post('/create-class', UserPermissionMiddleware.limitClassCreation, ClassController.creteClass);
router.post('/join-class', UserPermissionMiddleware.limitMemberInClassWhileJoinClass,ClassController.joinClasses);
router.post('/edit-class',ClassController.editClassInforClass);
router.post('/delete-class',ClassController.deleteClass);
router.post('/:id', ClassController.getClass);
router.post('/',ClassController.getAllClass);
router.post('/edit-permission', ClassController.editPermisstionClass)
module.exports = router;