const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const HomeWorkController = require('../../app/api/controllers/HomeworkController');
const SubmitHomeworkController = require('../../app/api/controllers/SubmitHomeworkController');
const upload = require('../../app/middlewares/upload');

router.use(verifyToken);
router.post('/create-normal-homework',upload, HomeWorkController.createNormalHomework);
router.post('/delete-homework', HomeWorkController.deleteHomework);
router.post('/get-detail-homework',HomeWorkController.getDetailHomework);
router.get('/get-all-homework',HomeWorkController.getAllHomewworkOfUser);
router.post('/update-normal-homework',upload, HomeWorkController.updateNormalHomework);
router.post('/submit-normal-homework',upload, SubmitHomeworkController.submitNormalHomework);
router.post('/cancel-submit', SubmitHomeworkController.cancelSubmit);
router.post('/display-assignment/', SubmitHomeworkController.displaySubmitInDetailHomework);

module.exports = router;