const HomeworkCategory = require('../../models/HomeworkCategory');
const mongoose = require('mongoose');
const User = require('../../models/User');

class HomeworkCategoryController{
    async getAll(req, res){
        await User.findOne({email: res.locals.email})
            .then(async user => {
                await HomeworkCategory.find({is_delete: false, user: mongoose.Types.ObjectId(user._id)})
                    .select('title id_homework_category')
                    .then(result => {
                    return res.json({
                        success: true,
                        message: "get all homework category successfull!",
                        data: result,
                        res_code: 200,
                        res_status: "GET_SUCCESSFULLY"
                    })
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
    async create(req, res){
        await User.findOne({email: res.locals.email})
            .then(async user => {
                await HomeworkCategory.create({
                    title: req.body.title,
                    user: mongoose.Types.ObjectId(user._id)
                })
                .then(async result => {
                    await HomeworkCategory.findById(result._id)
                        .select('title id_homework_category')
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
    async update(req, res){
        await HomeworkCategory.findOneAndUpdate(
            {id_homework_category: req.body.id_homework_category, is_delete: false}, {title: req.body.title}, {new: true})
            .then(result => {
                return res.json({
                    success: true,
                    message: "update exercises successfull!",
                    data: result,
                    res_code: 200,
                    res_status: "DELETE_SUCCESSFULLY"
                })
            })
    }
    async delete(req, res){
        await HomeworkCategory.findOneAndUpdate({id_homework_category: req.body.id_homework_category, is_delete: false}, {is_delete: true}, {new: true})
            .then(result => {
                return res.json({
                    success: true,
                    message: "Delete exercises successfull!",
                    res_code: 200,
                    res_status: "DELETE_SUCCESSFULLY"
                })
            })
    }
}

module.exports = new HomeworkCategoryController