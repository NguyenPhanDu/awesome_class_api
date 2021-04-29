const express = require('express');
const router = express.Router();

const AuthTypeAPIController = require('../app/api/controllers/AuthTypeAPIController');

router.post('/create',AuthTypeAPIController.create)

module.exports = router