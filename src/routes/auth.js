const express = require('express');
const router = express.Router();
const { checkDuplicateEmail, checkValidateEmail, checkValidatePassword } = require('../app/middlewares/verifyRegister')
const {verifyToken} = require('../app/middlewares/authJwt')
const AuthAPIController = require('../app/api/controllers/AuthAPIController');

router.post('/register',[checkDuplicateEmail ,checkValidateEmail, checkValidatePassword],AuthAPIController.signUp);
router.post('/login', AuthAPIController.signIn);
module.exports = router