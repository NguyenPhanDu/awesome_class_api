const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const UserPermissionMiddleware = require('../../app/middlewares/userPermission')
const ClassController = require('../../app/api/controllers/ClassController');

router.use(verifyToken);
router.post('/create-class', UserPermissionMiddleware.limitClassCreation, ClassController.creteClass);
router.post('/join-class', ClassController.joinClass);
router.post('/edit-class',ClassController.editClassInforClass);
router.post('/delete-class',ClassController.deleteClass);
router.post('/:id', ClassController.getClass);
router.post('/',ClassController.getAllClass);

module.exports = router;