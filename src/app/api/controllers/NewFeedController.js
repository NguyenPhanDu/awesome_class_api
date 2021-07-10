const mongoose = require('mongoose');
const ClassHomework = require('../../models/ClassHomework');
const ClassNews =require('../../models/ClassNews');
const ClassNewsAssign = require('../../models/ClassNewsAssign');
const Class = require('../../models/Class');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const ClassMember = require('../../models/ClassMember');
const HomeworkAssign = require('../../models/HomeworkAssign');
const moment = require('moment');
const { parseTimeFormMongo } = require('../../../helpers/parse_date');
class NewFeedController{
    async showNewFeed(req, res){
        try{
            // Kiểm tra xem thằng này trong lớp là teacher hay học sinh
            // Nếu là giáo viên kiểm tra xem bài tập nào của nó tạo trả hoặc bài tập khác của giáo viên khác = tất cả bài tập trong lớp đó về mảng theo thời gian mới nhất
            // Nếu là học sinh thì trả những bài tập mà học sinh đc assign
            const classs = await Class.findOne({id_class : Number(req.body.id_class)})
            let classId = classs._id;
            const user = await User.findOne( { email: res.locals.email } )
            let userId = user._id;
            const classMember = await ClassMember.findOne(
                { 
                    user: mongoose.Types.ObjectId(userId),
                    class: mongoose.Types.ObjectId(classId),
                    is_delete: false
                }
            )
            .populate('role')
            let newfeed = [];
            if(classMember.role.id_class_role == 1){
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
                const b = await ClassNews.find({ class: mongoose.Types.ObjectId(classId), is_delete: false }).populate('user', '-password')
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
                        ).populate('user','-password')
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
            else{
                let homeworkAssign = await HomeworkAssign.find(
                    {
                        user: mongoose.Types.ObjectId(userId),
                        class: mongoose.Types.ObjectId(classId),
                        is_delete: false
                    }
                );
                if(homeworkAssign.length > 0){
                    let a = JSON.parse(JSON.stringify(homeworkAssign));
                    for(let i = 0; i < a.length; i++){
                        let classHomework = await ClassHomework.findOne({ homework: mongoose.Types.ObjectId(a[i].homework), is_delete: false })
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
                        if(classHomework){
                            newfeed.push(classHomework);
                        }
                    }
                }
                let classNewsAssgin = await ClassNewsAssign.find(
                    {
                        user: mongoose.Types.ObjectId(userId),
                        class: mongoose.Types.ObjectId(classId),
                        is_delete: false
                    }
                );
                if(classNewsAssgin.length > 0){
                    let b = JSON.parse(JSON.stringify(classNewsAssgin));
                    for(let i = 0; i < b.length; i++){
                        let classNews = await ClassNews.findOne({_id: mongoose.Types.ObjectId(b[i].class_news), is_delete: false})
                        .populate('user', '-password')
                        .populate("document", "name viewLink downloadLink size id_files");
                        if(classNews){
                            const c = JSON.parse(JSON.stringify(classNews));
                            const arrayComment = await Comment.find(
                                { 
                                    is_delete: false,
                                    onModel: 'ClassNews',
                                    ref: mongoose.Types.ObjectId(c._id)
                                }
                            ).populate('user','-password')
                            c['comments'] = arrayComment
                            newfeed.push(c);
                        }
                    }
                }
                const sortNewFeed  = newfeed.sort((a,b) => moment(parseTimeFormMongo(b.createdAt), "YYYY-MM-DD HH:mm:ss") - moment(parseTimeFormMongo(a.createdAt), "YYYY-MM-DD HH:mm:ss"));
                res.json({
                    success: true,
                    message: "get newfeed successfull!",
                    data: sortNewFeed,
                    res_code: 200,
                    res_status: "GET_SUCCESSFULLY"
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

module.exports = new NewFeedController