const express = require('express');
const router = express.Router();
const {verifyToken} = require('../app/middlewares/authJwt');
const ClassController = require('../app/api/controllers/ClassController');

router.use(verifyToken);
router.post('/create-class',ClassController.creteClass);
router.post('/join-class', ClassController.joinClass);
router.post('/edit-class/:id',ClassController.editClass);
router.post('/delete-class/:id',ClassController.deleteClass);
router.post('/:id', ClassController.getClass);
router.post('/',ClassController.getAllClass);

module.exports = router;