const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../../app/api/controllers/ForgotPasswordController');

router.post('/send-mail',forgotPasswordController.sendReSetMail);
router.post('/',forgotPasswordController.handleForgotPassword);

module.exports = router;