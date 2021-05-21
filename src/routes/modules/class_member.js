const express = require('express');
const router = express.Router();
const ClassMemberController = require('../../app/api/controllers/ClassMemberController');
const {verifyToken} = require('../../app/middlewares/authJwt');

router.use(verifyToken);
router.post('/get-member',ClassMemberController.getMemberClass);
router.post('/delete-member', ClassMemberController.deleteMember);
router.post('/member-profile',ClassMemberController.getMemberProfile)
router.post('/invite-member',ClassMemberController.inviteMember);
router.get('/accept-invited',ClassMemberController.accpetInvited);

module.exports = router;