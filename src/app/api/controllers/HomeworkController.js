const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const HomeworkType = require('../../models/HomeworkType');
const NormalHomework = require('../../models/NormalHomework');
const ClassMember = require('../../models/ClassMember');
const ClassHomework = require('../../models/ClassHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const ClassRole = require('../../models/ClassRole');
const HomeworkCategory = require('../../models/HomeworkCategory');
const googleDriveCrud = require('../../google_drive/index');
const Directory = require('../../models/Directory');


class HomeWorkController{
    // Req:  id_class, title, description, deadline, start_date, total_scores, category : { title, id_homework_category}, student[];
    async createNormalHomework(req, res){
        const reqCategory = await JSON.parse(req.body.category);
        const reqTotalScore = await JSON.parse(req.body.total_scores);
        //let reqStudent = await JSON.parse(req.body.student);
        if(req.body.deadline == 'null'){
            req.body.deadline = null;
        }
        let blogalHomework
        let homeworkId;
        let classRoleStudentId;
        await ClassRole.findOne({id_class_role : 2})
            .then(classRole => {
                classRoleStudentId = classRole._id;
            })
        let userId;
        await User.findOne({email: res.locals.email})
            .then(user => {
                userId = user._id;
            })
        let classId;
        await Class.findOne({id_class : Number(req.body.id_class)})
            .then(classs => {
                classId = classs._id
            });
        let parentFolder;
        await Directory.findOne({refId: classId})
            .then(result=> {
                parentFolder = result;
            })
        //Vai trò của user trong class
        let userRole;
        await ClassMember.findOne({ user :  mongoose.Types.ObjectId(userId), class : mongoose.Types.ObjectId(classId)})
                .populate('role')
                .then(classMember => {
                    userRole = classMember.role.id_class_role;
                });
        if(userRole == 1){
            let homeWorkTypeId;
            await HomeworkType.findOne({id_homework_type: 1})
                    .then(homeWorkType => {
                        homeWorkTypeId = homeWorkType._id
                    })
            if(reqCategory == null){
                const newHomework = NormalHomework({
                    title: req.body.title,
                    description: req.body.description,
                    start_date: req.body.start_date,
                    deadline: req.body.deadline,
                    total_scores: reqTotalScore,
                    homework_type: mongoose.Types.ObjectId(homeWorkTypeId),
                    create_by: mongoose.Types.ObjectId(userId)
                });
                await newHomework.save()
                    .then(async homework => {
                        blogalHomework = homework;
                        await googleDriveCrud.createHomeworkFolder(homework.title,homework._id,parentFolder)
                        homeworkId = homework._id
                        await ClassHomework.create({
                            class: mongoose.Types.ObjectId(classId),
                            homework: mongoose.Types.ObjectId(homework._id),
                            onModel: 'NormalHomework'
                        })
                        .then(result => {
                        })
                        .catch(err => {
                            console.log(err);
                            return res.json({
                                success: false,
                                message: 'Server error. Please try again. create class homework failed',
                                error: err,
                                res_code: 500,
                                res_status: "SERVER_ERROR"
                            });
                        });
                        // Trường hợp chọn học sinh chỉ định
                        // if(reqStudent && reqStudent.length > 0){
                        //     let arrayUserId = [];
                        //     for(let i = 0; i < reqStudent.length; i++){
                        //         await ClassMember.findOne({class: mongoose.Types.ObjectId(classId), email: reqStudent[i].email })
                        //             .then(result => {
                        //                 arrayUserId.push(result.user)
                        //             })
                        //     }
                        //     let arrayUserIdLength = arrayUserId.length
                        //     for(let i = 0; i< arrayUserIdLength; i++){
                        //         HomeworkAssign.create({
                        //             user: mongoose.Types.ObjectId(arrayUserIdLength[i]),
                        //             class: mongoose.Types.ObjectId(classId),
                        //             homework: mongoose.Types.ObjectId(homework._id),
                        //             onModel: 'NormalHomework'
                        //         })
                        //     }
                        // }
                        // Trường hợp tất cả học sinh
                        // 1 tìm tất cả user học sinh trong class đó : find [ _id user ] tìm trong classMember;
                        // for list user vừa nhận mỗi lần lập tạo ra 1 Homeasgin với user là id đó
                        await ClassMember.find({ class: mongoose.Types.ObjectId(classId), role: mongoose.Types.ObjectId(classRoleStudentId) })
                            .then(classMember => {
                                for(let i =0; i< classMember.length; i++){
                                    HomeworkAssign.create({
                                        user: mongoose.Types.ObjectId(classMember[i].user),
                                        class: mongoose.Types.ObjectId(classId),
                                        homework: mongoose.Types.ObjectId(homework._id),
                                        onModel: 'NormalHomework'
                                    })
                                };
                            })
                            .catch(err => {
                                return res.json({
                                    success: false,
                                    message: 'Server error. Please try again. create homework assign failed',
                                    error: err,
                                    res_code: 500,
                                    res_status: "SERVER_ERROR"
                                });
                            });
                        return blogalHomework;
                    })
                    .then(async blogalHomework => {
                        if(req.files){
                            await googleDriveCrud.uploadFile(req.files, blogalHomework)
                        }
                    })
                    .then((blogalHomework)=>{
                        NormalHomework.findById(homeworkId)
                            .populate("homework_type", "-_id -__v")
                            .populate("create_by", "-_id -__v -password")
                            .populate("document", "name viewLink downloadLink size")
                            .then(result => {
                                console.log(result)
                                return res.json({
                                    success: true,
                                    message: "Create homework successfull!",
                                    data: result,
                                    res_code: 200,
                                    res_status: "CREATE_SUCCESSFULLY"
                                })
                            })
                    })
                    .catch(err => {
                        return res.json({
                            success: false,
                            message: 'Server error. Please try again. create homework failed',
                            error: err,
                            res_code: 500,
                            res_status: "SERVER_ERROR"
                        });
                    });
            }
            else{
                let categoryId;
                await HomeworkCategory.findOne({is_delete: false, id_homework_category: reqCategory.id_homework_category})
                    .then(async category => {
                        if(!category){
                            await HomeworkCategory.create({
                                title: reqCategory.title,
                                user: mongoose.Types.ObjectId(userId),
                                class: mongoose.Types.ObjectId(classId)
                            })
                            .then(result => {
                                categoryId = result._id;
                            })
                            .catch(err => {
                                console.log(err);
                            })
                            return categoryId;
                        }
                        return category._id;
                    })
                    .then(async result => {
                        const newHomework = NormalHomework({
                            title: req.body.title,
                            description: req.body.description,
                            start_date: req.body.start_date,
                            deadline: req.body.deadline,
                            total_scores: reqTotalScore,
                            homework_type: mongoose.Types.ObjectId(homeWorkTypeId),
                            create_by: mongoose.Types.ObjectId(userId),
                            homework_category: mongoose.Types.ObjectId(result)
                        });
                        await newHomework.save()
                            .then(async homework => {
                                await googleDriveCrud.createHomeworkFolder(homework.title,homework._id,parentFolder)
                                blogalHomework = homework;
                                homeworkId = homework._id
                                await ClassHomework.create({
                                    class: mongoose.Types.ObjectId(classId),
                                    homework: mongoose.Types.ObjectId(homework._id),
                                    onModel: 'NormalHomework'
                                })
                                .then(result => {
                                })
                                .catch(err => {
                                    return res.json({
                                        success: false,
                                        message: 'Server error. Please try again. create class homework failed',
                                        error: err,
                                        res_code: 500,
                                        res_status: "SERVER_ERROR"
                                    });
                                });
                                // if(reqStudent && reqStudent.length > 0){
                                //     let arrayUserId = [];
                                //     for(let i = 0; i < reqStudent.length; i++){
                                //         await ClassMember.findOne({class: mongoose.Types.ObjectId(classId), email: reqStudent[i].email })
                                //             .then(result => {
                                //                 arrayUserId.push(result.user)
                                //             })
                                //     }
                                //     let arrayUserIdLength = arrayUserId.length
                                //     for(let i = 0; i< arrayUserIdLength; i++){
                                //         HomeworkAssign.create({
                                //             user: mongoose.Types.ObjectId(arrayUserIdLength[i]),
                                //             class: mongoose.Types.ObjectId(classId),
                                //             homework: mongoose.Types.ObjectId(homework._id),
                                //             onModel: 'NormalHomework'
                                //         })
                                //     }
                                // }
                                // Trường hợp tất cả học sinh
                                // 1 tìm tất cả user học sinh trong class đó : find [ _id user ] tìm trong classMember;
                                // for list user vừa nhận mỗi lần lập tạo ra 1 Homeasgin với user là id đó
                                await ClassMember.find({ class: mongoose.Types.ObjectId(classId), role: mongoose.Types.ObjectId(classRoleStudentId) })
                                    .then(classMember => {
                                        for(let i =0; i< classMember.length; i++){
                                            HomeworkAssign.create({
                                                user: mongoose.Types.ObjectId(classMember[i].user),
                                                class: mongoose.Types.ObjectId(classId),
                                                homework: mongoose.Types.ObjectId(homework._id),
                                                onModel: 'NormalHomework'
                                            })
                                        };
                                    })
                                    .catch(err => {
                                        return res.json({
                                            success: false,
                                            message: 'Server error. Please try again. create homework assign failed',
                                            error: err,
                                            res_code: 500,
                                            res_status: "SERVER_ERROR"
                                        });
                                    });
                                    return blogalHomework;
                            })
                            .then(async blogalHomework => {
                                await googleDriveCrud.uploadFile(req.files, blogalHomework)
                            })
                            .then((homework)=>{
                                NormalHomework.findById(homeworkId)
                                    .populate("homework_type", "-_id -__v")
                                    .populate("create_by", "-_id -__v -password")
                                    .populate("homework_category", "-_id -__v")
                                    .populate("document", "name viewLink downloadLink size")
                                    .then(result => {
                                        return res.json({
                                            success: true,
                                            message: "Create homework successfull!",
                                            data: result,
                                            res_code: 200,
                                            res_status: "CREATE_SUCCESSFULLY"
                                        })
                                    })
                            })
                            .catch(err => {
                                return res.json({
                                    success: false,
                                    message: 'Server error. Please try again. create homework failed',
                                    error: err,
                                    res_code: 500,
                                    res_status: "SERVER_ERROR"
                                });
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
    };
    // Req: id_class_homework , homework_type : (1, 2, 3)
    async deleteHomework(req, res){
        let homeworkModel;
        if(Number(req.body.homework_type) == 1){
            homeworkModel = NormalHomework;
        }
        if(Number(req.body.homework_type) == 2){
            homeworkModel = '';
        }
        if(Number(req.body.homework_type) == 3){
            homeworkModel = '';
        }
        let createBy;
        await ClassHomework.findOne({id_class_homework: req.body.id_class_homework, is_delete: false})
            .populate({
                path: 'homework',
                populate: [
                {
                    path: 'create_by'
                }
                ]
            })
            .then(result => {
                createBy = result.homework.create_by.email;
            })
        if(createBy == res.locals.email){
            let homeworkId;
        await ClassHomework.findOneAndUpdate(
            {id_class_homework: req.body.id_class_homework, is_delete: false},
            { is_delete : true },
            {new: true}
        ).then(result => {
            homeworkId = result.homework
            return homeworkId;
        })
        .then(async homeworkId => {
            await HomeworkAssign.updateMany({homework : mongoose.Types.ObjectId(homeworkId), is_delete: false}, {is_delete : true})
                .then(result => {
                })
                .catch(err => {
                    console.log(err);
                    return res.json({
                        success: false,
                        message: 'Server error. Please try again. delete home work assign failed',
                        error: err,
                        res_code: 500,
                        res_status: "SERVER_ERROR"
                    });
                })
            return homeworkId
        })
        .then(async homeworkId => {
            console.log(homeworkId)
            await homeworkModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(homeworkId), is_delete: false},{is_delete : true}, {new : true} )
                .then(result => {
                    return res.status(200).json({
                        success: true,
                        message: "Delete exercises successfull!",
                        res_code: 200,
                        res_status: "DELETE_SUCCESSFULLY"
                    })
                })
                .catch(err => {
                    console.log(err);
                    return res.json({
                        success: false,
                        message: 'Server error. Delete Homework failed Please try again.',
                        error: err,
                        res_code: 500,
                        res_status: "SERVER_ERROR"
                    });
                })
        })
        .catch(err => {
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
        else{
            return res.json({
                success: false,
                message: "No access",
                res_code: 403,
                res_status: "NO_ACCESS"
            })
        }
    }
    //  Req:  id_class_homework , homework_type : (1, 2, 3)
    async getDetailHomework(req, res){
        let homeworkModel;
        if(Number(req.body.homework_type) == 1){
            homeworkModel = NormalHomework;
        }
        if(Number(req.body.homework_type) == 2){
            homeworkModel = '';
        }
        if(Number(req.body.homework_type) == 3){
            homeworkModel = '';
        }
        let homeworkId;
        await ClassHomework.findOne({id_class_homework: req.body.id_class_homework, is_delete: false})
        .then(classHomework => {
            homeworkId = classHomework.homework
            return homeworkId;
        })
        .then(async homeworkId => {
            await homeworkModel.findOne({_id : mongoose.Types.ObjectId(homeworkId)})
                .populate('homework_category',"title id_homework_category")
                .populate('homework_type',"name id_homework_type")
                .populate('create_by', "-password")
                .populate("document", "name viewLink downloadLink size")
                .then(homework => {
                    return res.status(200).json({
                        success: true,
                        message: "get detail exercise successfull!",
                        data: homework,
                        res_code: 200,
                        res_status: "DELETE_SUCCESSFULLY"
                    })
                })
                .catch(err => {
                    console.log(err);
                    return res.json({
                        success: false,
                        message: 'Server error. get homework failed.',
                        error: err,
                        res_code: 500,
                        res_status: "SERVER_ERROR"
                    });
                })
        })
        .catch(err => {
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

    // Get all homework of user login create and assgined
    async getAllHomewworkOfUser(req, res){
        let arrayHomework  = [];
        await ClassHomework.find()
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
                    match: { email : { $eq : res.locals.email } }
                }]
            })
            
            .then(homeworks => {
                let homeworksParte = JSON.parse(JSON.stringify(homeworks));
                if(homeworksParte.length > 0){
                    homeworksParte = homeworksParte.filter(homework => {
                        return homework.homework.create_by != null
                    });
                    homeworksParte.forEach(homework => {
                        arrayHomework.push(homework);
                    })
                }
            })
            .catch(err => {
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: error,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
        let user_id;
        await User.findOne({email: res.locals.email})
            .then(user => {
                user_id = user._id
            })
        await HomeworkAssign.find({user: mongoose.Types.ObjectId(user_id)})
            .then(async result => {
                let resultLength = result.length;
                if(resultLength > 0){
                    for(let i = 0 ; i< result.length; i++){
                        await ClassHomework.findOne({ homework: mongoose.Types.ObjectId(result[i].homework) })
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
                        .then(homeworks => {
                            let homeworksParte = JSON.parse(JSON.stringify(homeworks));
                            arrayHomework.push(homeworksParte)
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    }
                }
            })
            .catch(err => {
                console.log(err);
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: error,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            });
        return res.json({
            success: true,
            message: "get all homework successfull!",
            data: arrayHomework,
            res_code: 200,
            res_status: "CREATE_SUCCESSFULLY"
        })
    }
}

module.exports = new HomeWorkController;