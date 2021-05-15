const express = require('express');
const router = express.Router();
const ClassMemberController = require('../app/api/controllers/ClassMemberController');
const {verifyToken} = require('../app/middlewares/authJwt');

router.use(verifyToken);
router.get('/get-member/',ClassMemberController.getMemberClass);
router.post('/invite-member',ClassMemberController.inviteMember);
router.get('/accept-invited',ClassMemberController.accpetInvited)

module.exports = router;