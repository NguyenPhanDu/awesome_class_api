const mongoose = require('mongoose');
const HomeworkNotification = require('../../models/HomeworkNotification');
const Notification = require('../../models/Notification');
const CommentNotification = require('../../models/CommentNotification');
const User = require('../../models/User');
const moment = require('moment');
class NotificationController{
    async createAssignNotify(classes, ref, sender, receiver){
        try{
            const homeworkNotificationSchema = new HomeworkNotification({
                class : mongoose.Types.ObjectId(classes),
                ref: mongoose.Types.ObjectId(ref),
                type: 'ClassHomework',
                onModel: 'ClassHomework'
            });
            const homeworkNotification = await homeworkNotificationSchema.save();
            const now = moment().toDate().toString();
            await Notification.create({
                sender: mongoose.Types.ObjectId(sender),
                receiver: mongoose.Types.ObjectId(receiver),
                create_at: now,
                ref: mongoose.Types.ObjectId(homeworkNotification._id),
                type: 'HomeworkNotification',
                onModel: 'HomeworkNotification'
            })
        }
        catch(err){
            console.log(err)
            return;
        }
    }
    
    async createReturnHomeworkNotity(classes, ref, sender, receiver){
        try{
            const now = moment().toDate().toString();
            const homeworkNotificationSchema = new HomeworkNotification({
                class : mongoose.Types.ObjectId(classes),
                ref: mongoose.Types.ObjectId(ref),
                type: 'HomeworkAssign',
                onModel: 'HomeworkAssign'
            }); 
            const homeworkNotification = await homeworkNotificationSchema.save();
            const notify =  await Notification.create({
                sender: mongoose.Types.ObjectId(sender),
                receiver: mongoose.Types.ObjectId(receiver),
                create_at: now,
                ref: mongoose.Types.ObjectId(homeworkNotification._id),
                type: 'HomeworkNotification',
                onModel: 'HomeworkNotification'
            })
        }   
        catch(err){
            console.log(err);
            return;
        } 
    }
    
    async createUpdateHomeworkNotify(classes, ref, sender, receiver){
        try{
            const now = moment().toDate().toString();
            const homeworkNotificationSchema = new HomeworkNotification({
                class : mongoose.Types.ObjectId(classes),
                ref: mongoose.Types.ObjectId(ref),
                type: 'HomeworkUpdate',
                onModel: 'ClassHomework'
            }); 
            const homeworkNotification = await homeworkNotificationSchema.save();
            await Notification.create({
                sender: mongoose.Types.ObjectId(sender),
                receiver: mongoose.Types.ObjectId(receiver),
                create_at: now,
                ref: mongoose.Types.ObjectId(homeworkNotification._id),
                type: 'HomeworkNotification',
                onModel: 'HomeworkNotification'
            })
        }
        catch(err){
            console.log(err);
            return;
        }
    }

    async createCommentNotify(model, classes, ref, sender, receiver, create_at){
        try{
            const CommentNotificationSchema = new CommentNotification({
                class: mongoose.Types.ObjectId(classes),
                ref: mongoose.Types.ObjectId(ref),
                type: model,
                onModel: model
            });
            const commentNotification = await CommentNotificationSchema.save();
            const notify = await Notification.create({
                sender: mongoose.Types.ObjectId(sender),
                receiver: mongoose.Types.ObjectId(receiver),
                create_at: create_at,
                ref: mongoose.Types.ObjectId(commentNotification._id),
                type: 'CommentNotification',
                onModel: 'CommentNotification'
            })
            if(notify){
                console.log('Tạo notify thành công')
            }
        }
        catch(err){
            console.log(err);
            return;
        }
    }
    
    async getAllNotifyOfUser(req, res){
        try{
            const user = await User.findOne( { email: res.locals.email })
            const amount = Number(req.query.amount) || 10;
            const a = await Notification.find({ receiver: mongoose.Types.ObjectId(user._id) })
            .populate('sender', '-password')
            .populate('receiver', '-password')
            .populate({
                path: 'ref',
                populate:  [{
                    path: 'class',
                },
                {
                    path: 'ref',
                    populate: [
                        {
                            path: 'homework'
                        }
                    ]
                }
                ]
            })
            .limit(amount)
            .sort({ createdAt : -1 });
            
            res.json({
                success: true,
                message: "get all notify of users successfull!",
                data: a,
                res_code: 200,
                res_status: "GET_SUCCESSFULLY"
            })
        }
        catch(err){
            console.log(err)
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
        }
        
    }

    async readAllNotifyOfUser(req, res){
        try{
            const user = await User.findOne( { email: res.locals.email });
            await Notification.updateMany({ receiver: mongoose.Types.ObjectId(user._id) }, { is_read: true })
            res.json({
                success: true,
                message: "Read all the notices successfull",
                res_code: 200,
                res_status: "GET_SUCCESSFULLY"
            })
        }
        catch(err){
            console.log(err)
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
        }
    }
    // req.body.id_notification
    async readNotity(req, res){
        try{
            await Notification.findOneAndUpdate(
                {
                    id_notification: Number(req.body.id_notification)
                },
                {
                    is_read: true
                }
            )
            res.json({
                success: true,
                message: "read notify of users successfull!",
                res_code: 200,
                res_status: "UPDATE_SUCCESSFULLY"
            })
        }
        catch(err){
                console.log(err)
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
        }
    }
}

module.exports = new NotificationController