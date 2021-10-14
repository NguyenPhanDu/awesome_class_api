const mongoose = require('mongoose');
const ClassRole = require('../../models/ClassRole');
const Class = require('../../models/Class');
const ClassMember = require('../../models/ClassMember');
const User = require('../../models/User');
const ClassPermission = require('../../models/ClassPermisstion');
const ClassHomework = require('../../models/ClassHomework');
const ClassNews = require('../../models/ClassNews');
const HomeworkAssgin = require('../../models/HomeworkAssign');
const FavourateClass = require('../../models/FavouriteClass');
const TeacherPermisstion = require('../../models/TeacherPermisstion');
const StudentPermisstion = require('../../models/StudentPermisstion');
const generateRandomCode = require('../../../helpers/index');
const FolerServices = require('../../services/file_and_folder/index');
const imgur = require('../../imgur/service');
const ClassImage = require('../../models/ClassImage');
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
            });
        let permissionId;
        const classPermission = new ClassPermission();
        await classPermission.save()
            .then(newClassPermission => {
                permissionId = newClassPermission._id;
            })
        const newClass = new Class({
            admin:  mongoose.Types.ObjectId(user_id),
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            class_code: generateRandomCode(6),
            permission: mongoose.Types.ObjectId(permissionId)
        });
        await newClass.save()
            .then(async newClass => {
                await FolerServices.createClassFolder(newClass)
                const classMember = new ClassMember({
                    user: user_id,
                    role: class_role,
                    class: newClass._id,
                    status: 0
                })
                await classMember.save()
                    .then(newClassMember => {
                    })
                    .catch(err => {
                        console.log(err);
                    });
                let newClassPopulate;
                await Class.findOne({_id : newClass._id, is_delete: false})
                    .populate({
                        path: 'admin',
                        select:['profile','email']
                    })
                    .populate('permission')
                    .then( result =>{
                        newClassPopulate = result
                    })
                //await TeacherPermisstion.create({ class: mongoose.Types.ObjectId(newClass._id) });
                //await StudentPermisstion.create({ class: mongoose.Types.ObjectId(newClass._id) })
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

    async editClassInforClass(req, res){
        let joinEnable = true;
        let ableStudentInvite = true;
        if(req.body.permission){
            joinEnable = req.body.permission.joinable_by_code;
            ableStudentInvite = req.body.permission.able_invite_by_student;
        }
        // findOneAndUpdate class
        let queryClass = {id_class: Number(req.body.id_class)};
        let updateClass = 
            {
                name: req.body.name,
                description: req.body.description,
                category: req.body.category
            };
        let optionClass = {new: true}
        await Class.findOne({id_class: req.body.id_class})
                .populate({
                    path: 'admin',
                    select:['profile','email']
                })
                .populate('permission')
                .then(async classs => {
                    if(classs){
                        if(classs.admin.email == res.locals.email){
                            await ClassPermission.findOneAndUpdate(
                                {
                                    _id : mongoose.Types.ObjectId(classs.permission._id)
                                },
                                {
                                    joinable_by_code : joinEnable,
                                    able_invite_by_student : ableStudentInvite
                                },
                                {new: true}
                            ).then(classPermission => {

                            })
                            .catch(err => {
                                console.log(err);
                                return res.json({
                                    success: false,
                                    message: 'Server error. Please try again. Update class permission sai',
                                    error: err,
                                    res_code: 500,
                                    res_status: "SERVER_ERROR"
                                });
                            })
                            await Class.findOneAndUpdate({
                                _id : mongoose.Types.ObjectId(classs._id)
                            },
                            {
                                name: req.body.name,
                                description: req.body.description,
                                category: req.body.category
                            },
                            {
                                new: true
                            })
                                .populate({
                                    path: 'admin',
                                    select:['profile','email']
                                })
                                .populate('permission')
                                .then(classs => {
                                        return res.status(200).json({
                                        success: true,
                                        message: "Update classroom successfull!",
                                        data: classs,
                                        res_code: 200,
                                        res_status: "UPDATE_SUCCESSFULLY"
                                    })
                                })
                                .catch(err => {
                                    console.log(err);
                                    return res.json({
                                        success: false,
                                        message: 'Server error. Please try again. Update class failed',
                                        error: err,
                                        res_code: 500,
                                        res_status: "SERVER_ERROR"
                                    });
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
                })
                .catch(err=>{
                    return res.json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err,
                        res_code: 500,
                        res_status: "SERVER_ERROR"
                    });
                })
    };

    async deleteClass(req, res){
        try{
            const query = {id_class: Number(req.body.id_class), is_delete : false};
            const update = {
                is_delete: true
            };
            const option = {
                new: true
            }

            let classFinded = await Class.findOne(query)
                                            .populate({
                                                path: 'admin',
                                                select:['profile','email']
                                            });
            if (classFinded && classFinded.admin.email == res.locals.email){
                await ClassPermission.findOneAndUpdate({_id: mongoose.Types.ObjectId(classFinded.permission)},update,option);
                await ClassMember.updateMany({ class: mongoose.Types.ObjectId(classFinded._id) },update);
                const classDelete =  await Class.findOneAndUpdate(query, update, option);
                await ClassHomework.updateMany({class: mongoose.Types.ObjectId(classFinded._id)}, update);
                await HomeworkAssgin.updateMany({ class: mongoose.Types.ObjectId(classFinded._id) }, update);
                await ClassNews.updateMany({ class: mongoose.Types.ObjectId(classFinded._id)}, update);
                await FavourateClass.updateMany({ class: mongoose.Types.ObjectId(classFinded._id), update });
                await TeacherPermisstion.findOneAndUpdate({ class: mongoose.Types.ObjectId(classFinded._id) }, update);
                await StudentPermisstion.findOneAndUpdate({ class: mongoose.Types.ObjectId(classFinded._id) }, update);
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
        catch (err) {
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        };
    };
    // status: 0 = admin, 1= actived, 2= pending, 3= disable
    async getAllClass(req, res){
        let adminId;
        await User.findOne({email : req.body.email})
            .then(user => {
                adminId = user._id
            });
        await ClassMember.find({user: mongoose.Types.ObjectId(adminId), is_delete: false, $or: [{ status: 0 }, {status : 1}]})
            .populate({
                path:'user',
                select:['profile','email', 'user_type', 'id_user'], 
                populate: {
                    path: 'user_type'
                }
            })
            .populate('role')
            .populate(
                {
                    path: 'class',
                    populate: [{
                        path: 'admin',
                        select:['profile','email']
                    },
                    {
                        path: 'permission',
                    }
                    ]
                    ,
                    match: { is_delete: { $eq: false} }
                }
            )
            .then(async result => {
                let classArray = JSON.parse(JSON.stringify(result));
                let newClassArray = classArray.filter(classss => {
                    return classss.class != null
                });
                for(let classs of newClassArray){
                    await ClassMember.countDocuments({class: mongoose.Types.ObjectId(classs.class._id), is_delete: false ,$or: [{ status: 0 }, {status : 1}, {status : 3}]})
                        .then(count =>{
                            classs.class.member = count;
                        })
                        .catch(error => {
                            console.log(error);
                        }); 
                    await ClassHomework.countDocuments({class: mongoose.Types.ObjectId(classs.class._id), is_delete: false })
                        .then(count => {
                            classs.class.exercises = count;
                        })
                        .catch(error => {
                            console.log(error);
                        }); 
                }
                return newClassArray
            })
            .then(newClassArray => {
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
            });
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
                populate: [{
                    path: 'admin',
                    select:['profile','email']
                },
                {
                    path: 'permission',
                }
                ]
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
            .populate('permission')
            .then(async classes => {
                if(!classes){
                    return res.json({
                        success: false,
                        message: "Class not found",
                        res_code: 403,
                        res_status: "NOT_FOUND"
                    })
                }
                if(classes.permission.joinable_by_code == true){
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
                                                    populate: [{
                                                        path: 'admin',
                                                        select:['profile','email']
                                                    },
                                                    {
                                                        path: 'permission',
                                                    }
                                                    ]
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
                                        return res.json({
                                            success: false,
                                            message: 'Server error. Please try again.',
                                            error: err,
                                            res_code: 500,
                                            res_status: "SERVER_ERROR"
                                        });
                                    })
                            }
                            if(classMember.is_delete == true){
                                console.log("eeee")
                                let query = {class: mongoose.Types.ObjectId(classMember.class), user: mongoose.Types.ObjectId(classMember.user)};
                                let update = 
                                    {
                                        is_delete: false
                                    };
                                let option = {new: true};
                                await ClassMember.findOneAndUpdate(query, update, option)
                                    .populate({
                                        path: 'user',
                                        select:['profile','email']
                                    })
                                    .populate('role')
                                    .populate(
                                        {
                                            path: 'class',
                                            populate: [{
                                                path: 'admin',
                                                select:['profile','email']
                                            },
                                            {
                                                path: 'permission',
                                            }
                                            ]
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
                            return res.json({
                                success: false,
                                message: 'Server error. Please try again.',
                                error: err,
                                res_code: 500,
                                res_status: "SERVER_ERROR"
                            });
                        })
                }
                else{
                    return res.json({
                        success: false,
                        message: "This class unenable to join",
                        res_code: 403,
                        res_status: "UNENABLE_TO_JOIN"
                    })
                }
            })
            .catch(err => {
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
    }
    // req.body: id_class, image
    async updateClassImage(req, res){
        try{
            const classCurrent = await Class.findOne({ is_delete: false, id_class: req.body.id_class })
            .populate('admin');
            if(classCurrent.admin.email == res.locals.email){
                const classImage = await imgur.uploadBase64(req.body.image);
                const newClassImage = await ClassImage.create({
                    class: mongoose.Types.ObjectId(classCurrent._id),
                    image_id: classImage.id,
                    delete_hash: classImage.deletehash,
                    image_link: classImage.link
                });
                const data = await Class.findByOneAndUpdate(
                    {
                        id_class: Number(req.body.id_class),
                        is_delete: false
                    },
                    {
                        image: newClassImage.image_link
                    },
                    {
                        new: true
                    }
                )
                .populate({
                    path: 'admin',
                    select:['profile','email']
                })
                .populate('permission')
                return res.json({
                    success: true,
                    message: "update class image successfull!",
                    data: data,
                    res_code: 200,
                    res_status: "GET_SUCCESSFULLY"
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


module.exports = new ClassController