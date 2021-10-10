const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const ClassHomework = require('../../models/ClassHomework');
const ClassNews = require('../../models/ClassNews');
const SubmitHomework = require('../../models/SubmitHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const Comment = require('../../models/Comment');
const ClassRole = require('../../models/ClassRole');
const moment = require('moment');
const NotificationController = require('./NotificationController');
const ClassMember = require('../../models/ClassMember');
class CommentController{
    // Req.body: id_class, ref: 1 là comment của bài tập, 2 là classnews; id: của bài tập hoặc notify, content: nội dung comment
    // ref: 3 , id: id_submit_homework
    async create(req, res){
        try{
            let ref;
            let model;
            let listIdUser = [];
            let submitSenderComment;
            let submitReceiverComment;
            const user = await User.findOne({ email : res.locals.email});
            if(req.body.ref == 1){
                model = 'ClassHomework';
                ref = await ClassHomework.findOne({ id_class_homework: req.body.id, is_delete : false })

                // Notify
                const classRoleTeacher = await ClassRole.findOne({id_class_role : 1 });
                let classRoleTeacherId = classRoleTeacher._id;
                const allTeacherInClass = await ClassMember.find({ class: mongoose.Types.ObjectId(ref.class), role: mongoose.Types.ObjectId(classRoleTeacherId), is_delete: false});
                JSON.parse(JSON.stringify(allTeacherInClass));
                // push vào mảng học sinh
                allTeacherInClass.forEach(item => {
                    listIdUser.push(item.user);
                });
                let a = await HomeworkAssign.find({
                    class: mongoose.Types.ObjectId(ref.class),
                    homework: mongoose.Types.ObjectId(ref.homework),
                    onModel: "NormalHomework",
                    is_delete: false
                });
                JSON.parse(JSON.stringify(a));
                a.forEach(item => {
                    listIdUser.push(item.user);
                });

                listIdUser = listIdUser.filter(item => {
                    return item != user._id
                })
            }
            if(req.body.ref == 2){
                model = 'ClassNews';
                ref = await ClassNews.findOne({ id_class_news: req.body.id, is_delete: false })
                // tìm tất cả thành viên trong lớp ngoại trừ người comment
                const listUserCommentObject = await ClassMember.find({ is_delete: false, class: mongoose.Types.ObjectId(ref.class)});
                let listUserCommentObjectParse = JSON.parse(JSON.stringify(listUserCommentObject));
                if(listUserCommentObjectParse.length > 0){
                    let listUserComment  = listUserCommentObjectParse.map(item => {
                        return item.user
                    }); 
                    listIdUser = listUserComment.filter(item => {
                        return item != user._id
                    })
                }
            }
            if(req.body.ref == 3){
                model = 'SubmitHomework';
                ref = await SubmitHomework.findOne({ id_submit_homework: req.body.id, is_delete: false })
                .populate({
                    path: 'class_homework',
                    populate: {
                        path: 'homework'
                    }
                });


                if(ref.user == user._id){
                    submitSenderComment = user._id;
                    listIdUser.push(ref.class_homework.homework.create_by)
                }
                else{
                    submitSenderComment = ref.class_homework.homework.create_by;
                    listIdUser.push(ref.user)
                }
            }
            const now = moment().toDate().toString();
            const classs = await Class.findOne({ id_class: req.body.id_class, is_delete: false});
            const commentNew = await Comment.create({
                content: req.body.content,
                user: mongoose.Types.ObjectId(user._id),
                class: mongoose.Types.ObjectId(classs._id),
                ref: mongoose.Types.ObjectId(ref._id),
                onModel: model,
                create_at: now,
                update_at: now
            });

            const data = await Comment.findById(commentNew._id).populate('user','-password');
            res.json({
                success: true,
                message: "Comment successfully!",
                data: data,
                res_code: 200,
                res_status: "CREATE_SUCCESSFULLY"
            });
            if(req.body.ref == 1){
                await NotificationController.exerciseNotify(ref._id, user._id, listIdUser, 3);
            }
            if(req.body.ref == 2){
                await NotificationController.newsNotify(ref._id, user._id, listIdUser, 3) 
            }
            if(req.body.ref == 3){
                await NotificationController.submitNotify(ref.id, submitSenderComment, listIdUser, 2)
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
    };
    // ref: 1 là comment của bài tập, 2 là notify; id: của bài tập hoặc notify, content: nội dung comment
    // ref: 3 , id: id_submit_homework
    async getAllComment(req, res){
        try{
            let ref;
            let model;
            if(req.body.ref == 1){
                model = 'ClassHomework';
                ref = await ClassHomework.findOne({ id_class_homework: req.body.id, is_delete : false })
            }
            if(req.body.ref == 2){
                model = 'ClassNews';
                ref = await ClassNews.findOne({ id_class_news: req.body.id, is_delete: false })
            }
            if(req.body.ref == 3){
                model = 'HomeworkAssign';
                ref = await HomeworkAssign.findOne({ id_homework_assign: req.body.id, is_delete: false })
            }
            const comments = await Comment.find({ onModel: model, is_delete: false, ref: mongoose.Types.ObjectId(ref._id) })
            .populate('user', '-password');

            return res.json({
                success: true,
                message: "get all Comment successfully!",
                data: comments,
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
}

module.exports = new CommentController