const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const ClassHomework = require('../../models/ClassHomework');
const ClassNotification = require('../../models/ClassNotification');
const Comment = require('../../models/Comment');

class CommentController{
    // Req.body: id_class, ref: 1 là comment của bài tập, 2 là notify; id: của bài tập hoặc notify, content: nội dung commet
    async create(req, res){
        try{
            let ref;
            let model;
            if(req.body.ref == 1){
                model = 'ClassHomework';
                ref = await ClassHomework.findOne({ id_class_homework: id, is_delete : false })
            }
            if(req.body.ref == 2){
                model = 'ClassNotification';
                ref = ClassNotification.findOne({ id_class_notify: id, is_delete: false })
            }
            const now = moment().toDate().toString();
            const user = await User.findOne({ email : res.locals.email});
            const classs = await Class.findOne({ id_class: req.body.id_class, is_delete: false});
            const commentNew = await Comment.create({
                content: req.body.content,
                user: mongoose.Types.ObjectId(user._id),
                class: mongoose.Types.ObjectId(classs._id),
                ref: mongoose.Types.ObjectId(ref._id),
                onModel: model,
                create_at: now,
                update_at: now
            })
            const data = await Comment.findById(commentNew._id).populate('user','-password');
            return res.json({
                success: true,
                message: "Comment successfully!",
                data: data,
                res_code: 200,
                res_status: "CREATE_SUCCESSFULLY"
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
    };
    // req.body.id_comment
    async delete(req, res){
        try{
            const now = moment().toDate().toString();
            const comment = await Comment.findOne({ id_comment:  req.body.id_comment, is_delete: false})
            .populate('user', '-password');
            const classs = await Class.findById(mongoose.Types.ObjectId(comment.class))
            .populate('admin', '-password');
            const classAdmin = classs.admin.email;
            if(res.locals.email == comment.user.email || res.locals.email == classAdmin){
                await Comment.findOneAndUpdate(
                    { id_comment:  req.body.id_comment, is_delete: false },
                    { is_delete: true, update_at:now },
                    { new: true }
                );
                return res.json({
                    success: true,
                    message: "Delete comment successfully!",
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
    };
    // req.body.id_comment, content
    async update(req, res){
        try{
            const now = moment().toDate().toString();
            const comment = await Comment.findOne({ id_comment:  req.body.id_comment, is_delete: false})
            .populate('user', '-password');
            if(res.locals.email == comment.user.email){
                const commentUpdate = await Comment.findOneAndUpdate(
                    { id_comment:  req.body.id_comment, is_delete: false},
                    { 
                        content: req.body.content,
                        update_at: now
                    },
                    { new: true }
                )
                .populate('user', '-password');
                return res.json({
                    success: true,
                    message: "Update comment successfully!",
                    data: commentUpdate,
                    res_code: 200,
                    res_status: "UPDATE_SUCCESSFULLY"
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
}

module.exports = new CommentController