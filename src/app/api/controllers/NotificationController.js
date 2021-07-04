const mongoose = require('mongoose');
const HomeworkNotification = require('../../models/HomeworkNotification');
const Notification = require('../../models/Notification');
const CommentNotification = require('../../models/CommentNotification');
const User = require('../../models/User');

class NotificationController{
    async createAssignNotify(classes, ref, sender, receiver){
        try{
            const homeworkNotificationSchema = new HomeworkNotification({
                class : mongoose.Types.ObjectId(classes),
                ref: mongoose.Types.ObjectId(ref),
                type: 'ClassHomework'
            });
            const homeworkNotification = await homeworkNotificationSchema.save();
            const now = moment().toDate().toString();
            await Notification.create({
                sender: mongoose.Types.ObjectId(sender),
                receiver: mongoose.Types.ObjectId(receiver),
                create_at: now,
                ref: mongoose.Types.ObjectId(homeworkNotification._id),
                type: 'HomeworkNotification'
            })
            console.log('tạo thành công')
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
                type: 'HomeworkAssign'
            }); 
            const homeworkNotification = await homeworkNotificationSchema.save();
            const notify =  await Notification.create({
                sender: mongoose.Types.ObjectId(sender),
                receiver: mongoose.Types.ObjectId(receiver),
                create_at: now,
                ref: mongoose.Types.ObjectId(homeworkNotification._id),
                type: 'HomeworkNotification'
            })
            if(notify){
                console.log('tạo thành công')
            }
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
            });
            const commentNotification = await CommentNotificationSchema.save();
            const notify = await Notification.create({
                sender: mongoose.Types.ObjectId(sender),
                receiver: mongoose.Types.ObjectId(receiver),
                create_at: create_at,
                ref: mongoose.Types.ObjectId(commentNotification._id),
                type: 'CommentNotification'
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
            const amount = req.query.amount || 10;
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
}

module.exports = new NotificationController