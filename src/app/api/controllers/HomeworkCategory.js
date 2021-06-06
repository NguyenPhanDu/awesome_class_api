const HomeworkCategory = require('../../models/HomeworkCategory');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Class = require('../../models/Class')
class HomeworkCategoryController{
    // req.body.id_class
    async getAllCategoryInClass(req, res){
        let classId;
        await Class.findOne({id_class : Number(req.body.id_class)})
            .then(classs => {
                classId = classs._id
            });
        await HomeworkCategory.find({is_delete: false, class: mongoose.Types.ObjectId(classId)})
                .populate('user','-password')
                .then(result => {
                    return res.json({
                        success: true,
                        message: "get all homework category successfull!",
                        data: result,
                        res_code: 200,
                        res_status: "GET_SUCCESSFULLY"
                    })
                })
                .catch(err=> {
                    console.log(err);
                    return res.json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err,
                        res_code: 500,
                        res_status: "SERVER_ERROR"
                    });
                })
    }
    // req.body.id_class, req.body.title
    async create(req, res){
        let reqTitle = req.body.title.toLowerCase();
        let classId;
        let flag = false
        await Class.findOne({id_class : Number(req.body.id_class)})
            .then(classs => {
                classId = classs._id
            });
        await User.findOne({email: res.locals.email})
            .then(async user => {
                await HomeworkCategory.find({class: mongoose.Types.ObjectId(classId), is_delete: false})
                    .then(array => {
                        if(array.length>0){
                            for(let i = 0 ;i< array.length; i++){
                                if(reqTitle == array[0].title.toLowerCase()){
                                    flag = true;
                                    return res.json({
                                        success: false,
                                        message: 'This category already exist!',
                                        res_code: 422,
                                        res_status: "SERVER_ERROR"
                                    });
                                }
                            }
                        }
                    });
                if(flag == false){
                    await HomeworkCategory.create({
                        title: req.body.title,
                        user: mongoose.Types.ObjectId(user._id),
                        class: mongoose.Types.ObjectId(classId)
                    })    
                     .then(async result => {
                        await HomeworkCategory.findById(result._id)
                        .populate('user','-password')
                        .then(aa=> {
                            return res.json({
                                success: true,
                                message: "create homework category successfull!",
                                data: aa,
                                res_code: 200,
                                res_status: "GET_SUCCESSFULLY"
                            })
                        })
                        .catch(err=> {
                            console.log(err);
                            return res.json({
                                success: false,
                                message: 'Server error. Please try again.',
                                error: err,
                                res_code: 500,
                                res_status: "SERVER_ERROR"
                            });
                        })
                })
                .catch(err=> {           
                    console.log(err);
                    return res.json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err,
                        res_code: 500,
                        res_status: "SERVER_ERROR"
                    });
                })
                }
                
            })
            .catch(err=> {
                console.log(err);
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
    }
    // req.body.id_class, title, req.body.id_homework_category
    async update(req, res){
        let flag = false;
        let reqTitle = req.body.title.toLowerCase();
        let classId;
        await Class.findOne({id_class : Number(req.body.id_class)})
            .then(classs => {
                classId = classs._id
            });
        await HomeworkCategory.findOne({id_homework_category: req.body.id_homework_category, is_delete: false})
        .populate('user','-password')
        .then(async result => {
            if(result.user.email = res.locals.email){
                await HomeworkCategory.find({class: mongoose.Types.ObjectId(classId), is_delete: false})
                    .then(array => {
                        if(array.length>0){
                            for(let i = 0 ;i< array.length; i++){
                                if(reqTitle == array[0].title.toLowerCase()){
                                    flag = true;
                                    return res.json({
                                        success: false,
                                        message: 'This category already exist!',
                                        res_code: 422,
                                        res_status: "SERVER_ERROR"
                                    });
                                }
                            }
                        }
                    });
                if(flag == false){
                    await HomeworkCategory.findByIdAndUpdate(result._id, 
                        {
                            title: req.body.title,
                            is_delete: true
                        },
                        {
                            new: true
                        })
                        .then(async deleted => {
                            await HomeworkCategory.findById(deleted._id)
                                .populate('user','-password')
                                .then(result => {
                                    return res.status(200).json({
                                        success: true,
                                        message: "Update exercises successfull!",
                                        data: result,
                                        res_code: 200,
                                        res_status: "UPDATE_SUCCESSFULLY"
                                    })
                                })
                                .catch(err=> {
                                    console.log(err);
                                    return res.json({
                                        success: false,
                                        message: 'Server error. Please try again.',
                                        error: err,
                                        res_code: 500,
                                        res_status: "SERVER_ERROR"
                                    });
                                })
                            
                        })
                        .catch(err=> {
                            console.log(err);
                            return res.json({
                                success: false,
                                message: 'Server error. Please try again.',
                                error: err,
                                res_code: 500,
                                res_status: "SERVER_ERROR"
                            });
                        })
                }
            }
            else{
                return res.json({
                    success: false,
                    message: "No access",
                    res_code: 403,
                    res_status: "NO_ACCESS"
                })
            }
        })
        .catch(err=> {
            console.log(err);
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        })
    }
    // req.body.id_homework_category
    async delete(req, res){
        await HomeworkCategory.findOne({id_homework_category: req.body.id_homework_category, is_delete: false})
            .populate('user','-password')
            .then(async result => {
                if(result.user.email = res.locals.email){
                    await HomeworkCategory.findByIdAndUpdate(result._id, 
                        {
                            is_delete: true
                        },
                        {
                            new: true
                        })
                        .then(deleted => {
                            return res.status(200).json({
                                success: true,
                                message: "Delete exercises successfull!",
                                res_code: 200,
                                res_status: "DELETE_SUCCESSFULLY"
                            })
                        })
                }
                else{
                    return res.json({
                        success: false,
                        message: "No access",
                        res_code: 403,
                        res_status: "NO_ACCESS"
                    })
                }
            })
            .catch(err=> {
                console.log(err);
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
    }
}

module.exports = new HomeworkCategoryController