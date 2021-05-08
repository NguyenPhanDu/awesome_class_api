const express = require('express');
const router = express.Router();
const { checkDuplicateEmail, checkValidateEmail, checkValidatePassword } = require('../app/middlewares/verifyRegister');
const { checkDuplicateEmailFacebook, checkDuplicateEmailGoogle } =require('../app/middlewares/verifySocialLogin');
const {verifyToken} = require('../app/middlewares/authJwt')
const AuthAPIController = require('../app/api/controllers/AuthAPIController');
const SocialLoginController = require('../app/api/controllers/SocialLoginController');

router.post('/register',[checkDuplicateEmail ,checkValidateEmail, checkValidatePassword],AuthAPIController.signUp);
router.post('/login', AuthAPIController.signIn);
router.post('/login-with-facebook', checkDuplicateEmailFacebook, SocialLoginController.loginWithFacebook);
router.post('/login-with-google', checkDuplicateEmailGoogle, SocialLoginController.loginWithGoogle);

module.exports = router