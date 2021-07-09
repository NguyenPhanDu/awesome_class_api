const mongoose = require('mongoose');
const ClassHomework = require('../../models/ClassHomework');
const Class = require('../../models/Class');
const moment = require('moment');
const User = require('../../models/User');
const FavourateHomework = require('../../models/FavouriteHomework');
const FavourateClass = require('../../models/FavouriteClass');
const { parseTimeFormMongo } = require('../../../helpers/parse_date');
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
}

module.exports = new BookmarkController