const express = require('express');
const router = express.Router();
const ClassMemberController = require('../app/api/controllers/ClassMemberController');

router.get('/get-member/',ClassMemberController.getMemberClass);
router.post('/invite-member',ClassMemberController.inviteMember);
router.get('/accept-invited',ClassMemberController.accpetInvited)

module.exports = router;