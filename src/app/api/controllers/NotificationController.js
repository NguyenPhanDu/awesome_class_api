const mongoose = require('mongoose');
const HomeworkNotification = require('../../models/HomeworkNotification');
const Notification = require('../../models/Notification');
const CommentNotification = require('../../models/CommentNotification');
const Class =require('../../models/Class');
const ClassHomework = require('../../models/ClassHomework');
const ClassNews = require('../../models/ClassNews');
const HomeworkAssign = require('../../models/HomeworkAssign');
const User = require('../../models/User');
const { populate } = require('../../models/HomeworkNotification');
async function createAssignNotify(classes, ref, sender, receiver){
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
            onModel: 'HomeworkNotification'
        })
        console.log('tạo thành công')
    }
    catch(err){
        console.log(err)
        return;
    }
}

async function createCommentNotify(model, classes, ref, sender, receiver, create_at){
    try{
        const CommentNotificationSchema = new CommentNotification({
            class: mongoose.Types.ObjectId(classes),
            ref: mongoose.Types.ObjectId(ref),
            type: model,
        });
        const commentNotification = await CommentNotificationSchema.save();
        await Notification.create({
            sender: mongoose.Types.ObjectId(sender),
            receiver: mongoose.Types.ObjectId(receiver),
            create_at: create_at,
            ref: mongoose.Types.ObjectId(commentNotification),
            onModel: 'CommentNotification'
        })
        console.log('tạo thành công')
    }
    catch(err){
        console.log(err);
        return;
    }
}

async function getAllNotifyOfUser(req, res){
    const user = await User.findOne( { email: res.locals.email })
    //const amount = req.query.amount
    const a = Notification.find({ receiver: mongoose.Types.ObjectId(user) })
    .populate('sender', '-password')
    .populate('receiver', '-password')
    .populate({
        path: 'ref',
        populate:  [{
            path: 'class',
        },
        {
            path: 'ref',
        }
        ]
    })
}

module.exports = {
    createAssignNotify,
    createCommentNotify,
    getAllNotifyOfUser
}