const mongoose = require('mongoose');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const moment = require('moment');
class NotificationController{
    async getAllNotifyOfUser(req, res){
        try{
            const user = await User.findOne( { email: res.locals.email })
            const amount = Number(req.query.amount) || 10;
            const a = await Notification.find({ receiver: mongoose.Types.ObjectId(user._id) })
            .populate('sender', '-password')
            .populate({
                path: 'ref',
                populate:  [{
                    path: 'class',
                },
                {
                    path: 'homework'
                },
                {
                    path: 'assignment'
                }
                ]
            })
            .limit(amount)
            .sort({ createdAt : -1 });
            
            let b = JSON.parse(JSON.stringify(a));
            delete b.createdAt;
            delete b.updatedA;
            delete b.receiver;
            res.json({
                success: true,
                message: "get all notify of users successfull!",
                data: b,
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
    // model classnews
    async newsNotify(newsId, sender, receiver, flag){
        try{
            let type = '';
            if(flag == 1){
                // thông báo tạo
                type = "CREATE_NEWS"
            }
            if(flag == 2){
                // thông báo chỉnh sửa
                type = "UPDATE_NEWS"
            }
            if(flag == 3){
                // thông báo bình luận
                type = "COMMENT_NEWS"
            }
            const now = moment().toDate().toString();
            await Notification.create({
                sender: mongoose.Types.ObjectId(sender),
                receiver: receiver,
                create_at: now,
                ref: mongoose.Types.ObjectId(newsId),
                type: type,
                onModel: 'ClassNews'
            });
        }
        catch(err){
            console.log(err)
            return;
        }
    }
    // model classhomewwork
    async exerciseNotify(classHomeworkId, sender, receiver, flag){
        try{
            let type = '';
            if(flag == 1){
                // thông báo tạo
                type = "CREATE_EXERCISE"
            }
            if(flag == 2){
                // thông báo chỉnh sửa
                type = "UPDATE_EXERCISE"
            }
            if(flag == 3){
                // thông báo bình luận
                type = "COMMENT_EXERCISE"
            }
            const now = moment().toDate().toString();
            await Notification.create({
                sender: mongoose.Types.ObjectId(sender),
                receiver: receiver,
                create_at: now,
                ref: mongoose.Types.ObjectId(classHomeworkId),
                type: type,
                onModel: 'ClassHomework'
            });
        }
        catch(err){
            console.log(err);
            return
        }
    }

    // model submit
    async submitNotify(submitId, sender, receiver, flag){
        try{
            let type = '';
            if(flag == 1){
                // thông báo tạo
                type = "SIGN_SUBMITION"
            }
            if(flag == 2){
                // thông báo bình luận
                type = "COMMENT_SUBMITION"
            }
            const now = moment().toDate().toString();
            await Notification.create({
                sender: mongoose.Types.ObjectId(sender),
                receiver: receiver,
                create_at: now,
                ref: mongoose.Types.ObjectId(submitId),
                type: type,
                onModel: 'SubmitHomework'
            });
        }
        catch(err){
            console.log(err);
            return
        }
    }
    
}

module.exports = new NotificationController