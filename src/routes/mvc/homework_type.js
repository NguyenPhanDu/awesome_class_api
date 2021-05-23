const express = require('express');
const router = express.Router();

const HomeworkTypeController = require('../../app/controllers/HomeworkTypeController');

router.post('/create', HomeworkTypeController.create);

module.exports = router;