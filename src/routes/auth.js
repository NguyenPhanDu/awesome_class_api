const express = require('express');
const router = express.Router();
const { checkDuplicateEmail, checkValidateEmail, checkValidatePassword } = require('../app/middlewares/verifyRegister')
const UserAPIController = require('../app/api/controllers/UserAPIController');

router.post('/register',[checkDuplicateEmail ,checkValidateEmail, checkValidatePassword],UserAPIController.signUp);

module.exports = router