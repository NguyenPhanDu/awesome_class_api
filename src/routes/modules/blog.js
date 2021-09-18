const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const BlogController = require('../../app/api/controllers/BlogController');
const upload = require('../../app/middlewares/upload');
router.use(verifyToken);
router.post('/create', upload, BlogController.createBlog);

module.exports = router