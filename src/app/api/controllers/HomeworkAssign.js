const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const HomeworkType = require('../../models/HomeworkType');
const NormalHomework = require('../../models/NormalHomework');
const ClassMember = require('../../models/ClassMember');
const ClassHomework = require('../../models/ClassHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const moment = require('moment');
const { parseTimeFormMongo, changeTimeInDBToISOString } = require('../../../helpers/parse_date');
const ClassRole = require('../../models/ClassRole');

class HomeworkAssignController{
    async getAllHomeworkAssignInClass(req, res){
        let userId;
        await User.findOne({email: res.locals.email})
            .then(user => {
                userId = user._id;
            })
        let classId;
        await Class.findOne({id_class : Number(req.body.id_class)})
            .then(classs => {
                classId = classs._id
            })
        await HomeworkAssign.find({ class: mongoose.Types.ObjectId(classId), user: mongoose.Types.ObjectId(userId) })
            .populate({
                path: 'homework',
                populate: [{
                    path: 'homework_type',
                    select:['name','id_homework_type']
                },
                {
                    path: 'homework_category',
                    select:['title','id_homework_category']
                }
                ]
            })
            .then(result => {
                let newArray = result.map(classs => {
                    return classs.homework
                })
                res.json({
                    success: true,
                    message: "get all homework successfull!",
                    data: newArray,
                    res_code: 200,
                    res_status: "GET_SUCCESSFULLY"
                })
            })
            .catch(error => {
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: error,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
    }

    async getAllHomeworkHaveDueDate(req, res){
        try{
            const user_id = res.locals._id
            // lấy ra tất cả Homework assgin có status 0 is submit false
            let data = []
            const arrAssgin = await HomeworkAssign.find(
                {
                    user: mongoose.Types.ObjectId(user_id),
                    status: 0,
                    is_submit: false,
                    is_delete: false
                }
            )
            .populate({
                path: 'homework',
                match: { deadline : { $ne : null } }
            })
            if(arrAssgin.length > 0){
                let a = JSON.parse(JSON.stringify(arrAssgin));
                a = a.filter(homework => {
                    return homework.homework != null
                })
                for(let i = 0 ; i< a.length; i++){
                    let b = await ClassHomework.findOne({ homework: mongoose.Types.ObjectId(a[i].homework._id) , is_delete: false},)
                    .populate({
                        path: 'homework',
                        populate: [
                            {
                                path: 'homework_type',
                                select: ['name', 'id_homework_type']
                            },
                            {
                                path: 'homework_category',
                                select: ['title', 'id_homework_category']
                            },
                            {
                                path: 'document',
                                select: ["name", "viewLink", "downloadLink", "size"]
                            },
                            {
                            path: 'create_by',
                            select: ["-password"],
                        }]
                    })
                    
                    if(b){
                        let homeworksParte = JSON.parse(JSON.stringify(b));
                        data.push(homeworksParte)
                    }
                }
                data.sort((a,b) => moment(changeTimeInDBToISOString(a.homework.deadline), "YYYY-MM-DD HH:mm:ss") - moment(changeTimeInDBToISOString(b.homework.deadline), "YYYY-MM-DD HH:mm:ss"));
            }
            res.json({
                success: true,
                message: "get all assgin of user successfull!",
                data: data,
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

module.exports = new HomeworkAssignController