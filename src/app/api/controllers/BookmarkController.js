const mongoose = require('mongoose');
const ClassHomework = require('../../models/ClassHomework');
const Class = require('../../models/Class');
const moment = require('moment');
const User = require('../../models/User');
const FavourateHomework = require('../../models/FavouriteHomework');
const FavourateClass = require('../../models/FavouriteClass');
const { parseTimeFormMongo, changeTimeInDBToISOString } = require('../../../helpers/parse_date');
const FavouriteClass = require('../../models/FavouriteClass');

class BookmarkController{
    // truyền vào :
    // req.body.type:  == 1 là lớp yêu thích; 2 là bài tập
    // req.body.id: id của lớp, hoặc bài tập
    async addFavourate(req, res){
        try{
            const user = await User.findOne({ email : res.locals.email })
            if(req.body.type == 1){
                const classes = await Class.findOne({ id_class: Number(req.body.id) });
                // tìm kiếm xem có bài tập yêu thích của user đó ko
                // nếu có thì update is_delete = false
                // không có thì tạo mới
                const favourateClasskInDB = await FavourateClass.findOne(
                    {
                        user: mongoose.Types.ObjectId(user._id),
                        class: mongoose.Types.ObjectId(classes._id)
                    }
                );
                if(favourateClasskInDB){
                    const a = await FavourateClass.findOneAndUpdate(
                        {
                            _id: mongoose.Types.ObjectId(favourateClasskInDB._id)
                        },
                        {
                            is_delete: true
                        },
                        {
                            new : true
                        }
                    )
                    .populate({
                        path: 'class',
                    })
                    res.status(200).json({
                        success: true,
                        message: "Add homework to favourate list successfull!",
                        res_code: 200,
                        data: a,
                        res_status: "CREATE_SUCCESSFULLY"
                    })
                }
                else{
                    const a = await FavourateClass.create({
                        user: mongoose.Types.ObjectId(user._id),
                        class: mongoose.Types.ObjectId(classes._id)
                    })
                    const result = await FavourateClass.findById(a._id)
                    .populate({
                        path: 'class',
                    })

                    res.status(200).json({
                        success: true,
                        message: "Add class to favourate list successfull!",
                        res_code: 200,
                        data: result,
                        res_status: "CREATE_SUCCESSFULLY"
                    })
                }
            }
            if(req.body.type == 2){
                const classHomework = await ClassHomework.findOne({ id_class_homework: Number(req.body.id) });
                // tìm kiếm xem có bài tập yêu thích của user đó ko
                // nếu có thì update is_delete = false
                // không có thì tạo mới
                const favourateHomeworkInDB = await FavourateHomework.findOne(
                    {
                        user: mongoose.Types.ObjectId(user._id),
                        class_homework: mongoose.Types.ObjectId(classHomework._id)
                    }
                );
                if(favourateHomeworkInDB){
                    const a = await FavourateHomework.findOneAndUpdate(
                        {
                            _id: mongoose.Types.ObjectId(favourateHomeworkInDB._id)
                        },
                        {
                            is_delete: true
                        },
                        {
                            new : true
                        }
                    )
                    .populate({
                        path: 'class_homework',
                        populate: {
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
                        }
                    })
                    res.status(200).json({
                        success: true,
                        message: "Add homework to favourate list successfull!",
                        res_code: 200,
                        data: a,
                        res_status: "CREATE_SUCCESSFULLY"
                    })
                }
                else{
                    const a = await FavourateHomework.create({
                        user: mongoose.Types.ObjectId(user._id),
                        class_homework: mongoose.Types.ObjectId(classHomework._id)
                    })
                    const result = await FavourateHomework.findById(a._id)
                    .populate({
                        path: 'class_homework',
                        populate: {
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
                        }
                    })

                    res.status(200).json({
                        success: true,
                        message: "Add homework to favourate list successfull!",
                        res_code: 200,
                        data: result,
                        res_status: "CREATE_SUCCESSFULLY"
                    })
                }
            }
        }
        catch(err){
            console.log(err)
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
    // truyền vào :
    // req.body.type:  == 1 là lớp yêu thích; 2 là bài tập
    // req.body.id: id của lớp, hoặc bài tập
    async removeFavourate(req, res){
        try{
            const user = await User.findOne({ email : res.locals.email })
            if( req.body.type == 1 ){
                const classes = await Class.findOne({ id_class: Number(req.body.id) });
                await FavouriteClass.findOneAndUpdate(
                    {
                        user: mongoose.Types.ObjectId(user._id),
                        class: mongoose.Types.ObjectId(classes._id),
                        is_delete: false
                    },
                    {
                        is_delete: true
                    }
                )

                res.status(200).json({
                    success: true,
                    message: "Remove class from favourate list successfull!",
                    res_code: 200,
                    res_status: "DELETE_SUCCESSFULLY"
                })
            }

            if( req.body.type == 2){
                const classHomework = await ClassHomework.findOne({ id_class_homework: Number(req.body.id) });
                await FavourateHomework.findOneAndUpdate(
                    {
                        user: mongoose.Types.ObjectId(user._id),
                        class_homework: mongoose.Types.ObjectId(classHomework._id),
                        is_delete: false
                    },
                    {
                        is_delete: true
                    }
                )
                res.status(200).json({
                    success: true,
                    message: "Remove homework from favourate list successfull!",
                    res_code: 200,
                    res_status: "DELETE_SUCCESSFULLY"
                })
            }
        }
        catch(err){
            console.log(err)
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


    //trả về
    // [ 
    // Nhận biết trả về lớp hay bài tập thông qua trường: type
    // 
    //     {
    //         "is_delete": false,
    //         "type": "homework",
    //         "_id": "60e95369b912122e54fa5f87",
    //         "user": "60c4188c11c5761174614237",
    //         "class_homework": {
    //             "is_delete": false,
    //             "_id": "60e85f1568908414e8c3e9e4",
    //             "class": {
    //                 "is_delete": false,
    //                 "description": "1234567898741",
    //                 "category": "1234567899",
    //                 "_id": "60e6c11a8ae3371284244b13",
    //                 "admin": "60c4188c11c5761174614237",
    //                 "name": "Class test 8/7/2021",
    //                 "class_code": "ClHxti",
    //                 "permission": "60e6c11a8ae3371284244b12",
    //                 "createdAt": "2021-07-08T09:10:50.960Z",
    //                 "updatedAt": "2021-07-08T09:10:50.960Z",
    //                 "id_class": 26,
    //                 "__v": 0
    //             },
    //             "homework": {
    //                 "description": "",
    //                 "total_scores": null,
    //                 "homework_category": null,
    //                 "document": [
    //                     "60e85f2068908414e8c3e9eb"
    //                 ],
    //                 "is_delete": false,
    //                 "_id": "60e85f1568908414e8c3e9e3",
    //                 "title": "test create notify",
    //                 "start_date": "Fri Jul 09 2021",
    //                 "deadline": "Fri Jul 23 2021",
    //                 "homework_type": {
    //                     "_id": "60aa1b201fbd66149c4d7b42",
    //                     "name": "homework",
    //                     "id_homework_type": 1
    //                 },
    //                 "create_by": {
    //                     "profile": {
    //                         "name": {
    //                             "first_name": "Du",
    //                             "last_name": "Phan"
    //                         },
    //                         "gender": "",
    //                         "avatar": "https://i.imgur.com/9q1Cg5z.png",
    //                         "phone": "",
    //                         "address": "",
    //                         "about": "",
    //                         "dob": "23/06/2021"
    //                     },
    //                     "activated_code": "4DWaklNl",
    //                     "activated": true,
    //                     "status": 1,
    //                     "is_delete": false,
    //                     "social": "",
    //                     "social_id": "",
    //                     "_id": "60c4188c11c5761174614237",
    //                     "email": "phandutest1@gmail.com",
    //                     "password": "$2b$08$qgEtcBnzc0Vx8B4mSVEcJu76vLtKDdvuk4kRh40Mllq2/pO3i0dei",
    //                     "user_type": "608681dda9738121d4731e39",
    //                     "createdAt": "2021-06-12T02:14:36.462Z",
    //                     "updatedAt": "2021-06-26T19:10:38.188Z",
    //                     "id_user": 90,
    //                     "__v": 0
    //                 },
    //                 "createdAt": "2021-07-09T14:37:09.411Z",
    //                 "updatedAt": "2021-07-09T14:37:20.634Z",
    //                 "id_normal_homework": 86,
    //                 "__v": 0
    //             },
    //             "onModel": "NormalHomework",
    //             "createdAt": "2021-07-09T14:37:09.776Z",
    //             "updatedAt": "2021-07-09T14:37:09.776Z",
    //             "id_class_homework": 86,
    //             "__v": 0
    //         },
    //         "createdAt": "2021-07-10T07:59:37.457Z",
    //         "updatedAt": "2021-07-10T07:59:37.457Z",
    //         "id_favourite_homework": 2,
    //         "__v": 0
    //     },
    //     },
    //     {
    //         "is_delete": false,
    //         "type": "class",
    //         "_id": "60e95346b912122e54fa5f85",
    //         "user": "60c4188c11c5761174614237",
    //         "class": {
    //             "is_delete": false,
    //             "description": "1234567898741",
    //             "category": "1234567899",
    //             "_id": "60e6c11a8ae3371284244b13",
    //             "admin": "60c4188c11c5761174614237",
    //             "name": "Class test 8/7/2021",
    //             "class_code": "ClHxti",
    //             "permission": "60e6c11a8ae3371284244b12",
    //             "createdAt": "2021-07-08T09:10:50.960Z",
    //             "updatedAt": "2021-07-08T09:10:50.960Z",
    //             "id_class": 26,
    //             "__v": 0
    //         },
    //         "createdAt": "2021-07-10T07:59:02.462Z",
    //         "updatedAt": "2021-07-10T07:59:02.462Z",
    //         "id_favourite_class": 1,
    //         "__v": 0
    //     }
    // ]


    async getAll(req, res){
        try{
            const user = await User.findOne({ email : req.body.email })
            let list = [];
            let a = await FavourateHomework.find( { user: mongoose.Types.ObjectId(user._id), is_delete: false} )
            .populate({
                path: 'class_homework',
                populate: [
                    {
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
                    },
                    {
                        path: 'class'
                    }
                ]
            });
            if(a.length > 0){
                let b = JSON.parse(JSON.stringify(a));
                let length = b.length;
                for(let i = 0; i < length; i++ ){
                    list.push(b[i]);
                }
            }

            let c = await FavouriteClass.find({ user: mongoose.Types.ObjectId(user._id) })
            .populate('class')
            if(c.length > 0){
                let d = JSON.parse(JSON.stringify(c));
                let length = d.length;
                for(let i = 0; i < length; i++ ){
                    list.push(d[i]);
                }
            }
            const sortBookMark  = list.sort((a,b) => moment(changeTimeInDBToISOString(b.createdAt), "YYYY-MM-DD HH:mm:ss") - moment(changeTimeInDBToISOString(a.createdAt), "YYYY-MM-DD HH:mm:ss"));
            res.json({
                success: true,
                message: "get book mark successfull!",
                data: sortBookMark,
                res_code: 200,
                res_status: "GET_SUCCESSFULLY"
            })
            
        }
        catch(err){
            console.log(err)
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

module.exports = new BookmarkController