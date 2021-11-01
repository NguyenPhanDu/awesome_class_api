const moment = require('moment');
const { parseTimeFormMongo, changeTimeInDBToISOString } = require('../../../helpers/parse_date');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Blog = require('../../models/Blog');
const imgur = require('../../imgur/service');
const BlogFileSev = require('../../services/file_and_folder/index');
const FolerServices = require('../../services/file_and_folder/index');
const Image = require('../../models/Image');
const File = require('../../models/File')
class BlogController{
    // req.body.title, description, thumbnail
    async createBlog(req, res){
        try{
            const user = await User.findOne({ email: res.locals.email }).populate('user_type');
            if(user.user_type.id_user_type == 1){
                const now = moment().toDate().toString();
                const newBlog = await Blog.create({
                    create_by: mongoose.Types.ObjectId(user._id),
                    title: req.body.title,
                    description: req.body.description,
                    create_at: now,
                    update_at: now
                })
                if(req.body.thumbnail){
                    const thumbnail = await imgur.uploadBase64(req.body.thumbnail);
                    const newBlogThumbnail = await Image.create({
                        ref: mongoose.Types.ObjectId(newBlog._id),
                        onModel: 'Blog',
                        image_type: 3,
                        image_id: thumbnail.id,
                        delete_hash: thumbnail.deletehash,
                        image_link: thumbnail.link
                    });
                    await Blog.findByIdAndUpdate(
                        newBlog._id,
                        {
                            thumbnail: thumbnail.link
                        },
                        {
                            new: true
                        }
                    )
                }
                if(req.files){
                    if(req.files.length> 0){
                        for(let i = 0; i < req.files.length; i++){
                            await BlogFileSev.uploadFileBlog(user._id, req.files[i], newBlog._id);
                        }
                    }
                }
                const data = await Blog.findById(newBlog._id)
                .populate('create_by', '-password')
                .populate("document", "name viewLink downloadLink size id_files");
                const result = JSON.parse(JSON.stringify(data));
                res.json({
                    success: true,
                    message: "Create blog successfully!",
                    data: result,
                    res_code: 200,
                    res_status: "CREATE_SUCCESSFULLY"
                }) 
            }
            else{
                res.json({
                    success: false,
                    message: "No access",
                    res_code: 403,
                    res_status: "NO_ACCESS"
                })
            }
        }
        catch(err){
            console.log(err);
            res.json({
                success: false,
                message: 'Server error. Please try again',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        }
    }

    // req.body : title, description, id_blog, attachments, thumbnail
    async updateBlog(req, res){
        try{
            const user = await User.findOne({ email: res.locals.email }).populate('user_type');
            const blogWantUpdate = await Blog.findOne({ id_blog: Number(req.body.id_blog), is_delete: false })
                .populate('create_by', '-password');
            let reqAttachments = JSON.parse(req.body.attachments);
            const now = moment().toDate().toString();
            if(blogWantUpdate.create_by.email == res.locals.email){
                if(reqAttachments.length > 0){
                    let newDocument = [];
                    let length = reqAttachments.length
                    // Xóa tất cả file trong news đi
                    // làm document rỗng
                    // Lặp qua reqAttachment nếu có trong đó thì update trở lại thành false push lại database
                    await FolerServices.deleteFileWhenUpdate(blogWantUpdate._id, 3);
                    for(let i = 0; i < length; i++){
                        let file = await File.findOneAndUpdate({ id_files: reqAttachments[i].id_files }, { is_delete: false }, { new: true });
                        if(file){
                            newDocument.push(file._id);
                        } 
                    }
                    await Blog.findOneAndUpdate(
                        {_id: mongoose.Types.ObjectId(blogWantUpdate._id)},
                        {
                            document: newDocument
                        },
                        {new: true}
                    );
                }
                else{
                    await FolerServices.deleteFileWhenUpdate(blogWantUpdate._id, 1);
                    await ClassNews.findOneAndUpdate(
                        {_id: mongoose.Types.ObjectId(blogWantUpdate._id)},
                        {
                            document: []
                        },
                        {new: true}
                    );
                }
                if(req.files){
                    if(req.files.length> 0){
                        for(let i = 0; i < req.files.length; i++){
                            await BlogFileSev.uploadFileBlog(user._id, req.files[i], blogWantUpdate._id);
                        }
                    }
                }
                if(req.body.thumbnail){
                    const thumbnail = await imgur.uploadBase64(req.body.thumbnail);
                    const newBlogThumbnail = await BlogThumbnail.create({
                        ref: mongoose.Types.ObjectId(blogWantUpdate._id),
                        onModel: 'Blog',
                        image_type: 3,
                        image_id: thumbnail.id,
                        delete_hash: thumbnail.deletehash,
                        image_link: thumbnail.link
                    });
                    await Blog.findByIdAndUpdate(
                        blogWantUpdate._id,
                        {
                            thumbnail: newBlogThumbnail.image_link
                        },
                        {
                            new: true
                        }
                    )
                }

                const blogUpdate = await Blog.findByIdAndUpdate(
                    blogWantUpdate._id,
                    {
                        title: req.body.title,
                        description: req.body.description,
                        update_at: now
                    },
                    {
                        new: true
                    }
                )
                .populate('create_by', '-password')
                .populate("document", "name viewLink downloadLink size id_files");
                const data = JSON.parse(JSON.stringify(blogUpdate));
                return res.json({
                    success: true,
                    message: "Update blog successfully!",
                    data: data,
                    res_code: 200,
                    res_status: "UPDATE_SUCCESSFULLY"
                }) 
            }
            else{
                return res.json({
                    success: false,
                    message: "No access",
                    res_code: 403,
                    res_status: "NO_ACCESS"
                })
            }
        }
        catch(err){
            console.log(err);
            res.json({
                success: false,
                message: 'Server error. Please try again',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return;
        }
    }

    // req.body : id_blog
    async getDetailBlog(req, res){
        try{
            const blog = await Blog.findOne({ id_blog: Number(req.body.id_blog) })
            .populate('create_by', '-password')
            .populate("document", "name viewLink downloadLink size id_files");

            return res.json({
                success: true,
                message: "get detail blog successfully!",
                data: blog,
                res_code: 200,
                res_status: "GET_SUCCESSFULLY"
            }) 
        }
        catch(err){
            console.log(err);
            res.json({
                success: false,
                message: 'Server error. Please try again',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return;
        }
    }

    async getAllBlog(req, res){
        try{
            const list = await Blog.find({is_delete: false})
            .populate('create_by', '-password')
            .populate("document", "name viewLink downloadLink size id_files");

            const listb = JSON.parse(JSON.stringify(list));
            const data  = listb.sort((a,b) => moment(parseTimeFormMongo(b.createdAt), "YYYY-MM-DD HH:mm:ss") - moment(parseTimeFormMongo(a.createdAt), "YYYY-MM-DD HH:mm:ss"));
            res.json({
                success: true,
                message: "get all blog successfull!",
                data: data,
                res_code: 200,
                res_status: "GET_SUCCESSFULLY"
            })
        }
        catch(err){
            console.log(err);
            res.json({
                success: false,
                message: 'Server error. Please try again',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return;
        }
    }
    // req.body : id_blog
    async deleteBlog(req, res){
        try{
            const now = moment().toDate().toString();
            const blogWantDelete = await Blog.findOne({ id_blog: Number(req.body.id_blog) })
            .populate('create_by', '-password')
            if(blogWantDelete.create_by.email == res.locals.email){
                await File.updateMany({ blog: mongoose.Types.ObjectId(blogWantDelete._id) }, { is_delete: true });
                await Blog.findOneAndUpdate( 
                    { id_blog: Number(req.body.id_blog) },
                    {
                        update_at: now,
                        is_delete: true
                    }
                );
                return res.json({
                    success: true,
                    message: "Delete blog successfully!",
                    res_code: 200,
                    res_status: "DELETE_SUCCESSFULLY"
                }) 
            }
            else{
                return res.json({
                    success: false,
                    message: "No access",
                    res_code: 403,
                    res_status: "NO_ACCESS"
                })
            }
        }
        catch(err){

        }
    }
}

module.exports = new BlogController;