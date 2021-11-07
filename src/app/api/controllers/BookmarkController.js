const mongoose = require('mongoose');
const ClassHomework = require('../../models/ClassHomework');
const Class = require('../../models/Class');
const moment = require('moment');
const User = require('../../models/User');
const FavourateHomework = require('../../models/FavouriteHomework');
const ClassMember = require('../../models/ClassMember');
const FavourateClass = require('../../models/FavouriteClass');
const { parseTimeFormMongo, changeTimeInDBToISOString } = require('../../../helpers/parse_date');


const FavouriteClass = require('../../models/FavouriteClass');
const FavouriteHomework = require('../../models/FavouriteHomework');

class BookmarkController{
    // truyền vào :
    // req.body.type:  == 1 là lớp yêu thích; 2 là bài tập
    // req.body.id: id của lớp, hoặc bài tập
    async addFavourate(req, res){
        try{
            const user = await User.findOne({ email : res.locals.email })
            if(req.body.type == 1){
                const classes = await Class.findOne({ id_class: Number(req.body.id), is_delete: false });
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
                            is_delete: false
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
                        message: "Add class to favourate list successfull!",
                        res_code: 200,
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
                            is_delete: false
                        },
                        {
                            new : true
                        }
                    )
                    .populate({
                        path: 'class_homework',
                        select:["-_id"],
                        populate: {
                            path: 'homework',
                            select:["-_id"],
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
    async getAll(req, res){
        try{
            const user = await User.findOne({ email : res.locals.email })
            let list = [];
            let a = await FavourateHomework.find( { user: mongoose.Types.ObjectId(user._id), is_delete: false} )
            .select('-_id -user -__v')
            .populate({
                path: 'class_homework',
                select: '-class -createdAt -updatedAt -__v',
                populate: [
                    {
                        path: 'homework',
                        select:'-_id -createdAt -updatedAt -__v',
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
                            select:'email id_user -_id'
                        }
                        ]
                    }
                ]
            });
            if(a.length > 0){
                let b = JSON.parse(JSON.stringify(a));
                let length = b.length;
                for(let i = 0; i < length; i++ ){
                    const amoutFavourate = await FavouriteHomework.countDocuments({ class_homework: mongoose.Types.ObjectId(b[i].class_homework._id), is_delete: false });
                    b[i].class_homework.amountBookMark = amoutFavourate;
                    b[i].class_homework.bookMark = true
                    list.push(b[i]);
                }
            }

            let c = await FavouriteClass.find({ user: mongoose.Types.ObjectId(user._id), is_delete: false})
            .select('-_id -__v -user')
            .populate({
                path: 'class',
                select: '-__v -createdAt -updatedAt -permission',
                populate: [{
                    path: 'admin',
                    select:'profile email -_id'
                },
                ]
                ,
                match: { is_delete: { $eq: false} }
            })
            if(c.length > 0){
                let d = await JSON.parse(JSON.stringify(c));
                console.log(d)
                let length = d.length
                for(let i = 0; i < length; i++ ){
                    const amountMember = await ClassMember.countDocuments({class: mongoose.Types.ObjectId(d[i].class._id), is_delete: false ,$or: [{ status: 0 }, {status : 1}, {status : 3}]});
                    d[i].class.member = amountMember;
                    const amountHomework = await ClassHomework.countDocuments({class: mongoose.Types.ObjectId(d[i].class._id), is_delete: false });
                    d[i].class.exercises = amountHomework;
                    const amoutFavourate = await FavourateClass.countDocuments({ class: mongoose.Types.ObjectId(d[i].class._id), is_delete: false });
                    d[i].class.amountBookMark = amoutFavourate;
                    d[i].class.bookMark = true;
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