const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../app/middlewares/authJwt');
const BlogController = require('../../app/api/controllers/BlogController');
const upload = require('../../app/middlewares/upload');
router.use(verifyToken);
router.post('/create', upload, BlogController.createBlog);
router.post('/update', upload, BlogController.updateBlog);
router.post('/delete', BlogController.deleteBlog);
router.get('/detail', BlogController.getDetailBlog);
router.get('/get-all', BlogController.getAllBlog);
module.exports = router