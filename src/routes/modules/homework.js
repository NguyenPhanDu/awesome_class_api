const express = require('express');
const router = express.Router();

const HomeWorkController = require('../../app/api/controllers/HomeworkController');

router.post('/create-normal-homework', HomeWorkController.createNormalHomework);

module.exports = router;