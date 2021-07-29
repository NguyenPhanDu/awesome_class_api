const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const HomeworkAssignController = require('../../app/api/controllers/HomeworkAssign');

router.use(verifyToken);
router.post('/',HomeworkAssignController.getAllHomeworkAssignInClass);
router.get('/get-all-assgin',HomeworkAssignController.getAllHomeworkHaveDueDate);
module.exports = router;