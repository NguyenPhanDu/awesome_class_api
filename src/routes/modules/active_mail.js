const express = require('express');
const router = express.Router();
const ActiveEmail = require('../../app/controllers/ActiveEmailController');

router.get('/active/',ActiveEmail.ActiveAccount);

module.exports = router