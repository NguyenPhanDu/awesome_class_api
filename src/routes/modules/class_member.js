const express = require('express');
const router = express.Router();
const ClassMemberController = require('../../app/api/controllers/ClassMemberController');
const UserPermissionMiddleware = require('../../app/middlewares/userPermission')
const {verifyToken} = require('../../app/middlewares/authJwt');

router.get('/accept-invited',ClassMemberController.accpetInvited);
router.use(verifyToken);
router.post('/get-member',ClassMemberController.getMemberClass);
router.post('/get-student',ClassMemberController.getStudentInClass);
router.post('/delete-member', ClassMemberController.deleteMember);
router.post('/member-profile',ClassMemberController.getMemberProfile)
router.post('/invite-member', UserPermissionMiddleware.limitMemberInClassWhileInviteClass, ClassMemberController.inviteMember);
router.post('/out-class', ClassMemberController.outClass);
router.post('/delete-member', ClassMemberController.deleteMember);
router.post('/accept-invite-notify', ClassMemberController.accpetInvitedInNotify);
module.exports = router;