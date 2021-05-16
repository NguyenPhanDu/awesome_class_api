const mongoose = require('mongoose');
const ClassRole = require('../../models/ClassRole');
const Class = require('../../models/Class');
const ClassMember = require('../../models/ClassMember');
const User = require('../../models/User');
const generateRandomCode = require('../../../helpers/index');

class ClassController{
    async creteClass(req, res){
        let user_id;
        let class_role;
        await User.findOne({email : req.body.email})
            .then(user => {
                user_id = user._id
            });
        await ClassRole.findOne({id_class_role: 1})
            .then(classRole => {
                class_role = classRole._id
            })
        const newClass = new Class({
            admin:  mongoose.Types.ObjectId(user_id),
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            class_code: generateRandomCode(6)
        });
        await newClass.save()
            .then(async newClass => {
                const classMember = new ClassMember({
                    user: user_id,
                    role: class_role,
                    class: newClass._id,
                    status: 0
                })
                await classMember.save()
                    .then(newClassMember => {
                        console.log(newClassMember);
                    })
                    .catch(err => {
                        console.log(err);
                    });
                let newClassPopulate;
                await Class.findOne({_id : newClass._id})
                    .populate({
                        path: 'admin',
                        select:['profile','email']
                    })
                    .then( result =>{
                        newClassPopulate = result
                    })
                await res.json({
                    success: true,
                    message: "Create new classroom successfull!",
                    data: newClassPopulate,
                    res_code: 200,
                    res_status: "CREATE_SUCCESSFULLY"
                })
            })
            .catch(error =>{
                console.log(error);
                res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: error.message,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
    };

    async editClass(req, res){
        let adminId;
        await User.findOne({email : req.body.email})
            .then(user => {
                adminId = user.id_user
            });
        let query = {id_class: Number(req.params.id)};
        let update = 
            {
                name: req.body.name,
                description: req.body.description
            };
        let option = {new: true}
        await Class.findOneAndUpdate(query,update,option)
            .populate(
                {
                    path: 'admin',
                    select:['profile','email']
                }
            )
            .exec(function (err, classroom){
                if(classroom){
                    if(classroom.admin.id_user == adminId){
                        return res.status(200).json({
                            success: true,
                            message: "Update classroom successfull!",
                            data: classroom,
                            res_code: 200,
                            res_status: "UPDATE_SUCCESSFULLY"
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
                }
                if(err){
                    return res.json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: error.err,
                        res_code: 500,
                        res_status: "SERVER_ERROR"
                    });
                }
            });
    };

    async deleteClass(req, res){
        let adminId;
        await User.findOne({email : req.body.email})
            .then(user => {
                adminId = user.id_user
            });
        let query = {id_class: Number(req.params.id)};
        let update = 
            {
                is_deltete: true
            };
        let option = {new: true}
        await Class.findOneAndUpdate(query,update,option)
            .populate('admin')
            .exec(function (err, classroom){
                if(classroom){
                    if(classroom.admin.id_user == adminId){
                        return res.status(200).json({
                            success: true,
                            message: "Delete classroom successfull!",
                            res_code: 200,
                            res_status: "DELETE_SUCCESSFULLY"
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
                }
                if(err){
                    return res.json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: error.err,
                        res_code: 500,
                        res_status: "SERVER_ERROR"
                    });
                }
            });
    };
    // status: 0 = admin, 1= actived, 2= pending, 3= disable
    async getAllClass(req, res){
        let adminId;
        await User.findOne({email : req.body.email})
            .then(user => {
                adminId = user._id
            });
        await ClassMember.find({user: mongoose.Types.ObjectId(adminId), $or: [{ status: 0 }, {status : 1}]})
            .populate({
                path: 'user',
                select:['profile','email']
            })
            .populate('role')
            .populate(
                {
                    path: 'class',
                    populate: {
                        path: 'admin',
                        select:['profile','email']
                    },
                    match: { is_deltete: { $eq: false} }
                }
            )
            .then(async result => {
                let classArray = JSON.parse(JSON.stringify(result));
                let newClassArray = classArray.filter(classss => {
                    return classss.class != null
                });
                for(let classs of newClassArray){
                    await ClassMember.countDocuments({class: mongoose.Types.ObjectId(classs.class._id) ,$or: [{ status: 0 }, {status : 1}]})
                        .then(count =>{
                            classs.class.member = count;
                        })
                        .catch(error => {
                            console.log(error);
                        })
                }
                console.log("then1",newClassArray)
                return newClassArray
            })
            .then(newClassArray => {
                console.log("then2",newClassArray);
                res.json({
                    success: true,
                    message: "get all class successfull!",
                    data: newClassArray,
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
    };

    async getClass(req, res){
        let userId;
        await User.findOne({email : req.body.email})
            .then(user => {
                userId = user._id
            });
        let classId;
        await Class.findOne({id_class: req.params.id})
            .then(result =>{
                classId = result._id
            });
        let member;
        await ClassMember.countDocuments({class: mongoose.Types.ObjectId(classId)})
            .then(count =>{
                member = count;
            })
            .catch(error => {
                console.log(error);
            })
        await ClassMember.findOne(
            {
                user: mongoose.Types.ObjectId(userId),
                class: mongoose.Types.ObjectId(classId),
            }
        )
        .populate({
            path: 'user',
            select:['profile','email']
        })
        .populate('role')
        .populate(
            {
                path: 'class',
                populate: {
                    path: 'admin',
                    select:['profile','email']
                },
            }
        )
        .exec((err, result) => {
            if(result){
                let classes = JSON.parse(JSON.stringify(result));
                classes.class.member = member
                return res.json({
                    success: true,
                    message: "get class successfull!",
                    data: classes,
                    res_code: 200,
                    res_status: "GET_SUCCESSFULLY"
                })
            }
            if(err){
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: error.err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            }
        })
    };

    async joinClass(req, res){
        let user_id;
        let role_id;
        await User.findOne({email : req.body.email})
            .then(user => {
                user_id = user._id
            });
        await ClassRole.findOne({id_class_role: 2})
            .then(classRole => {
                role_id = classRole._id;
            });
        await Class.findOne({ class_code: req.body.class_code })
            .then(async classes => {
                if(!classes){
                    return res.json({
                        success: false,
                        message: "Class not found",
                        res_code: 403,
                        res_status: "NOT_FOUND"
                    })
                }
                if(classes){
                    await ClassMember.findOne({ class: mongoose.Types.ObjectId(classes._id), user: mongoose.Types.ObjectId(user_id)})
                        .then(async classMember => {
                            if(!classMember){
                                const newClassMember = ClassMember({
                                    user: mongoose.Types.ObjectId(user_id),
                                    class: mongoose.Types.ObjectId(classes._id),
                                    role: mongoose.Types.ObjectId(role_id),
                                    status: 1
                                })
                                await newClassMember.save()
                                    .then( async newClassMemberSave => {
                                        await ClassMember.findOne({ class: mongoose.Types.ObjectId(newClassMemberSave.class), user: mongoose.Types.ObjectId(newClassMemberSave.user)})
                                            .populate({
                                                path: 'user',
                                                select:['profile','email']
                                            })
                                            .populate('role')
                                            .populate(
                                                {
                                                    path: 'class',
                                                    populate: {
                                                        path: 'admin',
                                                        select:['profile','email']
                                                    },
                                                }
                                            )
                                            .then(result => {
                                                return res.json({
                                                    success: true,
                                                    message: "Join class successfull!",
                                                    data: result,
                                                    res_code: 200,
                                                    res_status: "GET_SUCCESSFULLY"
                                                })
                                            })
                                            .catch(err => {
                                                console.log('populate',err);
                                                return res.json({
                                                    success: false,
                                                    message: 'Server error. Please try again.',
                                                    error: err,
                                                    res_code: 500,
                                                    res_status: "SERVER_ERROR"
                                                });
                                            })
                                    })
                                    .catch(err => {
                                        console.log("save member sai",err);
                                        return res.json({
                                            success: false,
                                            message: 'Server error. Please try again.',
                                            error: err,
                                            res_code: 500,
                                            res_status: "SERVER_ERROR"
                                        });
                                    })
                            }
                            return res.json({
                                success: false,
                                message: "You joined class",
                                res_code: 403,
                                res_status: "FAILT"
                            })
                        })
                        .catch(err => {
                            console.log("find member sai",err);
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
            .catch(err => {
                console.log("find class sai", err)
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


module.exports = new ClassController