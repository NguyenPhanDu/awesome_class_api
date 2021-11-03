const express = require('express');
const router = express.Router();
const { checkDuplicateEmail } = require('../../app/middlewares/verifyRegister');
const { checkDuplicateEmailFacebook, checkDuplicateEmailGoogle } =require('../../app/middlewares/verifySocialLogin');
const AuthAPIController = require('../../app/api/controllers/AuthAPIController');
const SocialLoginController = require('../../app/api/controllers/SocialLoginController');

router.post('/register',checkDuplicateEmail, AuthAPIController.signUp);
router.post('/resend-active-code', AuthAPIController.resendVerifyCode);
router.post('/active/',AuthAPIController.verifyEmail)
router.post('/login', AuthAPIController.signIn);
router.post('/login-with-facebook', checkDuplicateEmailFacebook, SocialLoginController.loginWithFacebook);
router.post('/login-with-google', checkDuplicateEmailGoogle, SocialLoginController.loginWithGoogle);

module.exports = router