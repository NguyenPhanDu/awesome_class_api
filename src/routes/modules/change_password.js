const express = require('express');
const router = express.Router();

const {verifyToken} = require('../../app/middlewares/authJwt');
const ChangePasswordController = require('../../app/api/controllers/ChangePasswordController');

router.use(verifyToken);
router.post('/', ChangePasswordController.changePassword);

module.exports = router;