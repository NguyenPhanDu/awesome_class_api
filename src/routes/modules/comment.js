const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const CommentController = require('../../app/api/controllers/CommentController');

router.use(verifyToken);
router.post('/create', CommentController.create);
router.post('/update', CommentController.update);
router.post('/delete', CommentController.delete);

module.exports = router