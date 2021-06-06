const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const HomeworkCategoryController = require('../../app/api/controllers/HomeworkCategory');

router.use(verifyToken);
router.post('/',HomeworkCategoryController.getAllCategoryInClass);
router.post('/create', HomeworkCategoryController.create);
router.post('/delete', HomeworkCategoryController.delete);
router.post('/update', HomeworkCategoryController.update);
module.exports = router