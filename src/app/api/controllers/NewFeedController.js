const mongoose = require('mongoose');
const ClassHomework = require('../../models/ClassHomework');
const ClassNews =require('../../models/ClassNews');
const Class = require('../../models/Class');
const Comment = require('../../models/Comment');
const moment = require('moment');
const { parseTimeFormMongo } = require('../../../helpers/parse_date');
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
            const b = await ClassNews.find({ class: mongoose.Types.ObjectId(classId) }).populate('user', '-password')
            .populate("document", "name viewLink downloadLink size id_files");
            let arrayNotify =  JSON.parse(JSON.stringify(b));
            if(arrayNotify.length > 0){
                let l = arrayNotify.length;
                for(let i = 0; i< l;i++){
                    const arrayComment = await Comment.find(
                        { 
                            is_delete: false,
                            onModel: 'ClassNews',
                            ref: mongoose.Types.ObjectId(arrayNotify[i]._id)
                        }
                    );
                    arrayNotify[i].comments = arrayComment
                    newfeed.push(arrayNotify[i]);
                }
            };
            const sortNewFeed  = newfeed.sort((a,b) => moment(parseTimeFormMongo(b.createdAt), "YYYY-MM-DD HH:mm:ss") - moment(parseTimeFormMongo(a.createdAt), "YYYY-MM-DD HH:mm:ss"));
            res.json({
                success: true,
                message: "get newfeed successfull!",
                data: sortNewFeed,
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

module.exports = new NewFeedController