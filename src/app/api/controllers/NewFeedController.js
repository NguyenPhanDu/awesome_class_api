const mongoose = require('mongoose');
const ClassHomework = require('../../models/ClassHomework');
const ClassNotification =require('../../models/ClassNotification');
const Class = require('../../models/Class');
const moment = require('moment');
class NewFeedController{
    //
    async showNewFeed(req, res){
        try{
            const classs = await Class.findOne({id_class : Number(req.body.id_class)})
            let classId = classs._id;
            let newfeed = [];
            const a = await ClassHomework.find({class: mongoose.Types.ObjectId(classId), is_delete: false})
            .populate({
                path: 'homework',
                populate: [{
                    path: 'homework_type',
                    select:['name','id_homework_type']
                },
                {
                    path: 'homework_category',
                    select:['title','id_homework_category']
                },
                {
                    path: 'create_by'
                }
                ]
            });
            let arrayHomework = JSON.parse(JSON.stringify(a));
            if(arrayHomework.length > 0){
                let l = arrayHomework.length;
                for(let i = 0; i< l;i++){
                    newfeed.push(arrayHomework[i]);
                }
            }
            const b = await ClassNotification.find({ class: mongoose.Types.ObjectId(classId) }).populate('user', '-password');
            let arrayNotify =  JSON.parse(JSON.stringify(b));
            if(arrayNotify.length > 0){
                let l = arrayNotify.length;
                for(let i = 0; i< l;i++){
                    newfeed.push(arrayNotify[i]);
                }
            };
            const sortArrayNotify  = arrayNotify.sort((a,b) => moment(b.create_at, "MM-DD-YYYY HH:mm") - moment(a.create_at, "MM-DD-YYYY HH:mm"))
            res.json(sortArrayNotify)
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

module.exports = new NewFeedController