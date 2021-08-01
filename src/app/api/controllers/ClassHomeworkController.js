const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const HomeworkType = require('../../models/HomeworkType');
const NormalHomework = require('../../models/NormalHomework');
const ClassMember = require('../../models/ClassMember');
const ClassHomework = require('../../models/ClassHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const { parseTimeFormMongo } = require('../../../helpers/parse_date');
const { pagination } = require('../../../helpers/pagination');
const moment = require('moment');
const ClassNews = require('../../models/ClassNews');

class ClassHomeworkController{
    async getHomeworkInClass(req, res){
        let classId;
        await Class.findOne({id_class : Number(req.body.id_class)})
            .then(classs => {
                classId = classs._id
            })
        await ClassHomework.find({class: mongoose.Types.ObjectId(classId), is_delete: false})
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
            })
            .then(classmem => {
                let newArray = classmem.map(classs => {
                    return classs.homework
                })
                res.json({
                    success: true,
                    message: "get all homework successfull!",
                    data: classmem,
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
    async getAllClassOfUserInClass(req, res){
        try{
            const classs = await Class.findOne({id_class : Number(req.body.id_class)})
            let classId = classs._id;
            console.log(classs)
            const user = await User.findOne( { email: res.locals.email } )
            let userId = user._id;
            let arrayHomework;
            //const a = await Class.findOne({ _id: '61065145789b490710d72e6c' })
            //console.log(a)
            // Kiểm tra xem thằng này trong lớp là teacher hay học sinh
            // Nếu là giáo viên kiểm tra xem bài tập nào của nó tạo trả hoặc bài tập khác của giáo viên khác = tất cả bài tập trong lớp đó về mảng theo thời gian mới nhất
            // Nếu là học sinh thì trả những bài tập mà học sinh đc assign
            const classMember = await ClassMember.findOne(
                { 
                    user: mongoose.Types.ObjectId(userId),
                    class: mongoose.Types.ObjectId(classId),
                    is_delete: false
                }
            )
            .populate('role')
            if(classMember.role.id_class_role == 1){
                let allClassHomework = await ClassHomework.find({class: mongoose.Types.ObjectId(classId), is_delete: false})
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
                        path: 'create_by',
                        select:['-password']
                    }
                    ]
                })
                const arr = JSON.parse(JSON.stringify(allClassHomework));
                arrayHomework = arr.sort((a,b) => moment(parseTimeFormMongo(b.createdAt), "YYYY-MM-DD HH:mm:ss") - moment(parseTimeFormMongo(a.createdAt), "YYYY-MM-DD HH:mm:ss"));
                res.json({
                    success: true,
                    message: "get all homework successfull!",
                    data: arrayHomework,
                    res_code: 200,
                    res_status: "GET_SUCCESSFULLY"
                })
            }
            else{
                let homeworkAssign = await HomeworkAssign.find(
                    {
                        user: mongoose.Types.ObjectId(userId),
                        class: mongoose.Types.ObjectId(classId),
                        is_delete: false,
                    }
                );
                console.log(homeworkAssign)
                let a = JSON.parse(JSON.stringify(homeworkAssign));
                let b = a.map(x => x.homework)
                let array = [];
                for(let i = 0; i< b.length; i++){
                    let a = await ClassHomework.findOne({ homework: mongoose.Types.ObjectId(b[i]), is_delete: false })
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
                            path: 'create_by',
                            select:['-password']
                        }
                        ]
                    })
                    array.push(a);
                }
                let c = JSON.parse(JSON.stringify(array));
                arrayHomework = c.sort((a,b) => moment(parseTimeFormMongo(b.createdAt), "YYYY-MM-DD HH:mm:ss") - moment(parseTimeFormMongo(a.createdAt), "YYYY-MM-DD HH:mm:ss"));
                res.json({
                    success: true,
                    message: "get all homework successfull!",
                    data: arrayHomework,
                    res_code: 200,
                    res_status: "GET_SUCCESSFULLY"
                })
            }
        }
        catch(err){
            console.log(err)
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: error,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        }
    }


    // async getAllClassOfUserInClass(req, res){
    //     try{
    //         const classs = await Class.findOne({id_class : Number(req.body.id_class)})
    //         let classId = classs._id;
    //         const user = await User.findOne( { email: res.locals.email } )
    //         let userId = user._id;
    //         let arrayHomework;
    //         // Kiểm tra xem thằng này trong lớp là teacher hay học sinh
    //         // Nếu là giáo viên kiểm tra xem bài tập nào của nó tạo trả hoặc bài tập khác của giáo viên khác = tất cả bài tập trong lớp đó về mảng theo thời gian mới nhất
    //         // Nếu là học sinh thì trả những bài tập mà học sinh đc assign
    //         const classMember = await ClassMember.findOne(
    //             { 
    //                 user: mongoose.Types.ObjectId(userId),
    //                 class: mongoose.Types.ObjectId(classId),
    //                 is_delete: false
    //             }
    //         )
    //         .populate('role')
    //         if(classMember.role.id_class_role == 1){
    //             let perPage = 5;
    //             let page = req.params.page;
    //             let allClassHomework = await ClassHomework.find({class: mongoose.Types.ObjectId(classId), is_delete: false})
    //             .populate({
    //                 path: 'homework',
    //                 populate: [{
    //                     path: 'homework_type',
    //                     select:['name','id_homework_type']
    //                 },
    //                 {
    //                     path: 'homework_category',
    //                     select:['title','id_homework_category']
    //                 },
    //                 {
    //                     path: 'create_by',
    //                     select:['-password']
    //                 }
    //                 ]
    //             })
    //             .skip((perPage * page) - perPage)
    //             .limit(perPage)
    //             .sort({ createdAt : -1 });
    //             //const arr = JSON.parse(JSON.stringify(allClassHomework));
    //             //arrayHomework = arr.sort((a,b) => moment(parseTimeFormMongo(b.createdAt), "YYYY-MM-DD HH:mm:ss") - moment(parseTimeFormMongo(a.createdAt), "YYYY-MM-DD HH:mm:ss"));
    //             res.json({
    //                 success: true,
    //                 message: "get all homework successfull!",
    //                 data: allClassHomework,
    //                 res_code: 200,
    //                 res_status: "GET_SUCCESSFULLY"
    //             })
    //         }
    //         else{
    //             let perPage = 5;
    //             let page = req.params.page;
    //             let homeworkAssign = await HomeworkAssign.find(
    //                 {
    //                     user: mongoose.Types.ObjectId(userId),
    //                     class: mongoose.Types.ObjectId(classId),
    //                     is_delete: false
    //                 }
    //             )
    //             let a = JSON.parse(JSON.stringify(homeworkAssign));
    //             let b = a.map(x => x.homework)
    //             let array = [];
    //             for(let i = 0; i< b.length; i++){
    //                 let a = await ClassHomework.findOne({ homework: mongoose.Types.ObjectId(b[i]), is_delete: false })
    //                 .populate({
    //                     path: 'homework',
    //                     populate: [{
    //                         path: 'homework_type',
    //                         select:['name','id_homework_type']
    //                     },
    //                     {
    //                         path: 'homework_category',
    //                         select:['title','id_homework_category']
    //                     },
    //                     {
    //                         path: 'create_by',
    //                         select:['-password']
    //                     }
    //                     ]
    //                 })
    //                 array.push(a);
    //             }
    //             let c = JSON.parse(JSON.stringify(array));
    //             arrayHomework = c.sort((a,b) => moment(parseTimeFormMongo(b.createdAt), "YYYY-MM-DD HH:mm:ss") - moment(parseTimeFormMongo(a.createdAt), "YYYY-MM-DD HH:mm:ss"));
    //             let data = pagination(arrayHomework, page, perPage);
    //             res.json({
    //                 success: true,
    //                 message: "get all homework successfull!",
    //                 data: data,
    //                 res_code: 200,
    //                 res_status: "GET_SUCCESSFULLY"
    //             })
    //         }
    //     }
    //     catch(err){
    //         console.log(err)
    //         return res.json({
    //             success: false,
    //             message: 'Server error. Please try again.',
    //             error: error,
    //             res_code: 500,
    //             res_status: "SERVER_ERROR"
    //         });
    //     }
    // }
}   

module.exports = new ClassHomeworkController
