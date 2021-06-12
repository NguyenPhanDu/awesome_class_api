const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const ClassMember = require('../../models/ClassMember');
const ClassNotification = require('../../models/ClassNotification');
const Comment = require('../../models/Comment');
const moment = require('moment');

class ClassNotificationController{
    // req.body : id_class, title, description
    async create(req, res){
        try{
            const now = moment().format('MM:DD:YYYY HH:mm');
            const user = await User.findOne({ email : req.body.email});
            const classs = await Class.findOne({ id_class: req.body.id_class, is_delete: false});
            const classMember = await ClassMember.findOne({ user :  mongoose.Types.ObjectId(user._id), class : mongoose.Types.ObjectId(classs._id)})
                                        .populate('role');
            if(classMember.role.id_class_role == 1){
                const classNotification = await ClassNotification.create({
                    user: mongoose.Types.ObjectId(user._id),
                    class: mongoose.Types.ObjectId(classs._id),
                    title: req.body.title,
                    description: req.body.description,
                    create_at: now,
                    update_at: now
                });
                const data = await ClassNotification.findById(classNotification._id)
                    .populate('user', '-password');
                return res.json({
                    success: true,
                    message: "Create notification successfully!",
                    data: data,
                    res_code: 200,
                    res_status: "CREATE_SUCCESSFULLY"
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
    // req.body : id_class_notify
    async delete(req, res){
        try{
            const notifyWanDelete = await ClassNotification.findOne({ id_class_notify: req.body.id_class_notify, is_delete: false })
                .populate('user','-password');
            if(notifyWanDelete.user.email == res.locals.email){
                await ClassNotification.findOneAndUpdate(
                    { id_class_notify: req.body.id_class_notify, is_delete: false },
                    { is_delete: true },
                    { new : true }
                );
                return res.json({
                    success: true,
                    message: "Delete notification successfully!",
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
    // req.body : id_class, title, description, id_class_notify
    async update(req, res){
        try{
            const now = moment().format('MM:DD:YYYY HH:mm');
            const notifyWantUpdate = await ClassNotification.findOne({ id_class_notify: req.body.id_class_notify, is_delete: false })
                .populate('user','-password');
            if(notifyWantUpdate.user.email == res.locals.email){
                const notifyUpdate = await ClassNotification.findOneAndUpdate(
                    { id_class_notify: req.body.id_class_notify, is_delete: false },
                    {  
                        title: req.body.title,
                        description: req.body.description,
                        update_at: now
                    },
                    { new : true }
                );
                const data = ClassNotification.findById(notifyUpdate._id)
                    .populate('user','-password');
                return res.json({
                    success: true,
                    message: "Create notification successfully!",
                    data: data,
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
    // req.body : id_class_notify
    async getDetailNotify(req, res){
        try{
            const notify =  await ClassNotification.findOne({ id_class_notify: req.body.id_class_notify }).populate('user', '-password');
            const arrayComment = await Comment.find(
                { 
                    is_delete: false,
                    onModel: 'ClassNotification',
                    ref: mongoose.Types.ObjectId(notify._id)
                }
            )
            .populate('user', '-password');
            let data = JSON.parse(JSON.stringify(notify));
            data['comments'] = arrayComment;
            return res.json({
                success: true,
                message: "get detail notification successfully!",
                data: data,
                res_code: 200,
                res_status: "DELETE_SUCCESSFULLY"
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
    // req.body : id_class
    async getAllNotifyInClass(req, res){
        try{
            const classs = await Class.findOne({ id_class: req.body.id_class, is_delete: false});
            const allNotify = await ClassNotification.find({ class: mongoose.Types.ObjectId(classs._id) }).populate('user', '-password');
            return res.json({
                success: true,
                message: "get all notification successfully!",
                data: allNotify,
                res_code: 200,
                res_status: "DELETE_SUCCESSFULLY"
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

module.exports = new ClassNotificationController;