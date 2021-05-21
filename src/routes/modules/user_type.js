const express = require('express');
const router = express.Router();

const UserTypeAPIController = require('../../app/api/controllers/UserTypeAPIController');

router.post('/create',UserTypeAPIController.create)

module.exports = router