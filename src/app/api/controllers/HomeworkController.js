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
const FolerServices = require('../../services/file_and_folder/index');
const Comment = require('../../models/Comment');
const File = require('../../models/File');
class HomeWorkController{
    // Req:  id_class, title, description, deadline, start_date, total_scores, category : { title, id_homework_category}, emails[];
    async createNormalHomework(req, res){
        try{
            let reqStudent = await JSON.parse(req.body.emails);
            let reqCategory = await JSON.parse(req.body.category);
            let reqTotalScore = await JSON.parse(req.body.total_scores);
            if(req.body.deadline == 'null'){
                req.body.deadline = null;
            }
            const classRole = await ClassRole.findOne({id_class_role : 2})
            let classRoleStudentId = classRole._id
            const user = await User.findOne({email: res.locals.email})
            let userId = user._id;
            const classs = await Class.findOne({id_class : Number(req.body.id_class)})
            let classId = classs._id
            const homeWorkType =  await HomeworkType.findOne({id_homework_type: 1});
            let homeWorkTypeId = homeWorkType._id
            //Vai trò của user trong class (tìm giáo viên chỉ giáo viên mới đc tạo)
            const classMember = await ClassMember.findOne({ user :  mongoose.Types.ObjectId(userId), class : mongoose.Types.ObjectId(classId)})
                                    .populate('role');
            let userRole = classMember.role.id_class_role;
            if(userRole == 1){
                if(reqCategory == null){
                    let homework = NormalHomework({
                        title: req.body.title,
                        description: req.body.description,
                        start_date: req.body.start_date,
                        deadline: req.body.deadline,
                        total_scores: reqTotalScore,
                        homework_type: mongoose.Types.ObjectId(homeWorkTypeId),
                        create_by: mongoose.Types.ObjectId(userId)
                    });
                    let newHomework = await homework.save();
                    let classHomework = await ClassHomework.create({
                        class: mongoose.Types.ObjectId(classId),
                        homework: mongoose.Types.ObjectId(newHomework._id),
                        onModel: 'NormalHomework'
                    });
                    await FolerServices.createFolderHomework(userId,classId,classHomework);
                    if(req.files){
                        if(req.files.length> 0){
                            for(let i = 0; i < req.files.length; i++){
                                await FolerServices.uploadHomeworkTeacherFile(userId, classId, classHomework,req.files[i], newHomework._id);
                            }
                        }
                    }
                    if(reqStudent.length > 0){
                        let arrayUserId = [];
                        for(let i = 0; i < reqStudent.length; i++){
                            let user =  await User.findOne({email: reqStudent[i] })
                            arrayUserId.push(user._id)
                        }
                        for(let i = 0; i< arrayUserId.length; i++){
                            await HomeworkAssign.create({
                                user: mongoose.Types.ObjectId(arrayUserId[i]),
                                class: mongoose.Types.ObjectId(classId),
                                homework: mongoose.Types.ObjectId(newHomework._id),
                                onModel: 'NormalHomework'
                            })
                        }
                    }
                    else{
                        let arrStudentInClass = await ClassMember.find({ class: mongoose.Types.ObjectId(classId), role: mongoose.Types.ObjectId(classRoleStudentId), is_delete: false })
                        if(arrStudentInClass.length > 0){
                            for(let i =0; i< arrStudentInClass.length; i++){
                                await HomeworkAssign.create({
                                    user: mongoose.Types.ObjectId(arrStudentInClass[i].user),
                                    class: mongoose.Types.ObjectId(classId),
                                    homework: mongoose.Types.ObjectId(newHomework._id),
                                    onModel: 'NormalHomework'
                                });
                            };
                        }
                    };
                    const homeworkCreated = await NormalHomework.findById(newHomework._id)
                                    .populate("homework_type", "-_id -__v")
                                    .populate("create_by", "-_id -__v -password")
                                    .populate("homework_category", "-_id -__v")
                                    .populate("document", "name viewLink downloadLink size id_files");
                    return res.json({
                        success: true,
                        message: "Create homework successfull!",
                        data: homeworkCreated,
                        res_code: 200,
                        res_status: "CREATE_SUCCESSFULLY"
                    })
                }
                else{
                    let flag = false;
                    let allCategoryInClass = await HomeworkCategory.find({class: mongoose.Types.ObjectId(classId), is_delete: false})
                    const allCategoryInClassLengnt = allCategoryInClass.length
                    if(allCategoryInClassLengnt > 0){
                        for(let i = 0 ;i< allCategoryInClassLengnt; i++){
                            if(reqCategory.title.toLowerCase() == allCategoryInClass[0].title.toLowerCase()){
                                flag = true;
                                res.json({
                                    success: false,
                                    message: 'This category already exist!',
                                    res_code: 422,
                                    res_status: "SERVER_ERROR"
                                });
                                return;
                            }
                        }
                    }
                    if(flag == false){
                        const newHomeworkCategory = await HomeworkCategory.create({
                            title: reqCategory.title,
                            user: mongoose.Types.ObjectId(userId),
                            class: mongoose.Types.ObjectId(classId)
                        });
                        let homework = NormalHomework({
                            title: req.body.title,
                            description: req.body.description,
                            start_date: req.body.start_date,
                            deadline: req.body.deadline,
                            total_scores: reqTotalScore,
                            homework_type: mongoose.Types.ObjectId(homeWorkTypeId),
                            homework_category: mongoose.Types.ObjectId(newHomeworkCategory._id),
                            create_by: mongoose.Types.ObjectId(userId)
                        });
                        let newHomework = await homework.save();
                        let classHomework = await ClassHomework.create({
                            class: mongoose.Types.ObjectId(classId),
                            homework: mongoose.Types.ObjectId(newHomework._id),
                            onModel: 'NormalHomework'
                        });
                        await FolerServices.createFolderHomework(userId,classId,classHomework);
                        if(req.files){
                            if(req.files.length> 0){
                                for(let i = 0; i < req.files.length; i++){
                                    await FolerServices.uploadHomeworkTeacherFile(userId, classId, classHomework,req.files[i], newHomework._id);
                                }
                            }
                        }
                        if(reqStudent.length > 0){
                            let arrayUserId = [];
                            for(let i = 0; i < reqStudent.length; i++){
                                let user =  await User.findOne({email: reqStudent[i] })
                                arrayUserId.push(user._id)
                            }
                            for(let i = 0; i< arrayUserId.length; i++){
                                await HomeworkAssign.create({
                                    user: mongoose.Types.ObjectId(arrayUserId[i]),
                                    class: mongoose.Types.ObjectId(classId),
                                    homework: mongoose.Types.ObjectId(newHomework._id),
                                    onModel: 'NormalHomework'
                                })
                            }
                        }
                        else{
                            let arrStudentInClass = await ClassMember.find({ class: mongoose.Types.ObjectId(classId), role: mongoose.Types.ObjectId(classRoleStudentId), is_delete: false })
                            if(arrStudentInClass > 0){
                                for(let i =0; i< arrStudentInClass.length; i++){
                                    await HomeworkAssign.create({
                                        user: mongoose.Types.ObjectId(arrStudentInClass[i].user),
                                        class: mongoose.Types.ObjectId(classId),
                                        homework: mongoose.Types.ObjectId(newHomework._id),
                                        onModel: 'NormalHomework'
                                    })
                                };
                            }
                        };
                        const homeworkCreated = await NormalHomework.findById(newHomework._id)
                                        .populate("homework_type", "-_id -__v")
                                        .populate("create_by", "-_id -__v -password")
                                        .populate("homework_category", "-_id -__v")
                                        .populate("document", "name viewLink downloadLink size id_files");
                        return res.json({
                            success: true,
                            message: "Create homework successfull!",
                            data: homeworkCreated,
                            res_code: 200,
                            res_status: "CREATE_SUCCESSFULLY"
                        })
                    }
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
    };
    // Req: id_class_homework , homework_type : (1, 2, 3)
    async deleteHomework(req, res){
        try{
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
            const classHomeWork = await ClassHomework.findOne({id_class_homework: req.body.id_class_homework, is_delete: false})
                                                        .populate({
                                                            path: 'homework',
                                                            populate: [
                                                            {
                                                                path: 'create_by'
                                                            }
                                                            ]
                                                        });
            if(classHomeWork.homework.create_by.email == res.locals.email){
                await FolerServices.deleteHomeworkFolder(classHomeWork.class,classHomeWork);
                await ClassHomework.findOneAndUpdate(
                    {id_class_homework: req.body.id_class_homework, is_delete: false},
                    { is_delete : true },
                    {new: true}
                );
                await HomeworkAssign.updateMany({homework: mongoose.Types.ObjectId(classHomeWork.homework._id), is_delete: false}, {is_delete: true});
                await homeworkModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(classHomeWork.homework._id), is_delete: false},{is_delete : true}, {new : true} );
                return res.status(200).json({
                    success: true,
                    message: "Delete exercises successfull!",
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
        catch(err){
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        };
    }
    //  Req:  id_class_homework , homework_type : (1, 2, 3)
    async getDetailHomework(req, res){
        try{
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
            const classHomework = await ClassHomework.findOne({id_class_homework: req.body.id_class_homework, is_delete: false});
            let homeworkId = classHomework.homework;
            const arrayCommet = await Comment.find({ onModel: 'ClassHomework', is_delete: false, ref: mongoose.Types.ObjectId(classHomework._id) })
            .populate('user', '-password');
            let homeworkNoAssigned = await homeworkModel.findOne({_id : mongoose.Types.ObjectId(homeworkId)})
                .populate('homework_category',"title id_homework_category")
                .populate('homework_type',"name id_homework_type")
                .populate('create_by', "-password")
                .populate("document", "name viewLink downloadLink size id_files");
            let arrayStudentAssgined = await HomeworkAssign.find({ homework: mongoose.Types.ObjectId(homeworkNoAssigned._id) })
                                                .populate('user', '-__v, -password');
            let arrayStudentAssginedEmail = [];
            arrayStudentAssgined.forEach(student => {
                arrayStudentAssginedEmail.push(student.user.email);
            });

            let finalResult = JSON.parse(JSON.stringify(homeworkNoAssigned));
            finalResult['student_assgined'] = arrayStudentAssginedEmail;
            finalResult['comments'] = arrayCommet;
            finalResult['id_class_homework'] = classHomework.id_class_homework
            return res.status(200).json({
                success: true,
                message: "get detail exercise successfull!",
                data: finalResult,
                res_code: 200,
                res_status: "DELETE_SUCCESSFULLY"
            })
        }
        catch(err){
            console.log(err);
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        }
    }

    // Get all homework of user login create and assgined
    async getAllHomewworkOfUser(req, res){
        let arrayHomework  = [];
        await ClassHomework.find({is_delete: false})
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
        await HomeworkAssign.find({user: mongoose.Types.ObjectId(user_id), is_delete: false})
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
    };
    // Req: homework_type : (1, 2, 3), id_class_homework, title, description, deadline, start_date, total_scores, category : { title, id_homework_category}, emails[];
    async updateNormalHomework(req, res){
        // Req:  id_class, title, description, deadline, start_date, total_scores, category : { title, id_homework_category}, emails[];
        try{
            let reqAttachments = JSON.parse(req.body.attachments);
            let reqStudent = await JSON.parse(req.body.emails);
            let reqCategory = await JSON.parse(req.body.category);
            let reqTotalScore = await JSON.parse(req.body.total_scores);
            if(req.body.deadline == 'null'){
                req.body.deadline = null;
            }
            const classHomeWork = await ClassHomework.findOne({ id_class_homework: Number(req.body.id_class_homework), is_delete: false})
            .populate({
                path: 'homework',
                populate: {
                    path: 'create_by'
                }
            });
            let classId = classHomeWork.class
            const user = await User.findOne({email: res.locals.email})
            const userId = user._id;
            let categoryUpdateId;
            if(classHomeWork.homework.create_by.email == res.locals.email){
                let update = { 
                    description: req.body.description,
                    title: req.body.title,
                    deadline: req.body.deadline,
                    total_scores: reqTotalScore,
                }
                if(reqCategory){
                    let flag = false;
                    if(reqCategory.id_homework_category == -1){
                        let allCategoryInClass = await HomeworkCategory.find({class: mongoose.Types.ObjectId(classHomeWork.class), is_delete: false})
                        const allCategoryInClassLengnt = allCategoryInClass.length
                        if(allCategoryInClassLengnt > 0){
                            for(let i = 0 ;i< allCategoryInClassLengnt; i++){
                                if(reqCategory.title.toLowerCase() == allCategoryInClass[0].title.toLowerCase()){
                                    flag = true;
                                    console.log(flag)
                                    res.json({
                                        success: false,
                                        message: 'This category already exist!',
                                        res_code: 422,
                                        res_status: "SERVER_ERROR"
                                    });
                                    return;
                                }
                            }
                        }
                        if(flag == false){
                            const newHomeworkCategory = await HomeworkCategory.create({
                                title: reqCategory.title,
                                user: mongoose.Types.ObjectId(userId),
                                class: mongoose.Types.ObjectId(classHomeWork.class)
                            });
                            categoryUpdateId = newHomeworkCategory._id
                        }
                    }
                    else{
                        const homeworkCategory = await HomeworkCategory.findOne({id_homework_category: reqCategory.id_homework_category, is_delete: false});
                        console.log(homeworkCategory);
                        categoryUpdateId = homeworkCategory._id
                    }
                    update = { 
                        description: req.body.description,
                        title: req.body.title,
                        deadline: req.body.deadline,
                        total_scores: reqTotalScore,
                        homework_category: mongoose.Types.ObjectId(categoryUpdateId),
                    }
                }  
                await HomeworkAssign.updateMany(
                    { 
                        class: mongoose.Types.ObjectId(classHomeWork.class),
                        homework: mongoose.Types.ObjectId(classHomeWork.homework._id),
                        onModel: "NormalHomework",
                        is_delete: false
                    },
                    {
                        is_delete: true
                    }
                );

                if(reqStudent.length > 0 ){
                    let arrLength = reqStudent.length
                    for(let i = 0; i<arrLength;i++ ){
                        let ddd = await User.findOne({email: reqStudent[i]})
                        let userIds = ddd._id;
                        let a = await HomeworkAssign.findOne({
                            class: mongoose.Types.ObjectId(classHomeWork.class),
                            homework: mongoose.Types.ObjectId(classHomeWork.homework._id),
                            onModel: "NormalHomework",
                            user: mongoose.Types.ObjectId(userIds)
                        });
                        if(a){
                            await HomeworkAssign.findByIdAndUpdate(a._id, { is_delete : false });
                        }
                        else{
                            await HomeworkAssign.create({
                                user: mongoose.Types.ObjectId(userIds),
                                class: mongoose.Types.ObjectId(classHomeWork.class),
                                homework: mongoose.Types.ObjectId(classHomeWork.homework._id),
                                onModel: 'NormalHomework'
                            }) 
                        }
                    }
                }
                else{
                    let arrLength = reqStudent.length
                    for(let i = 0; i<arrLength;i++ ){
                        let ddd = await User.findOne({email: reqStudent[i]})
                        let userIds = ddd._id;
                        let a = await HomeworkAssign.findOne({
                            class: mongoose.Types.ObjectId(classHomeWork.class),
                            homework: mongoose.Types.ObjectId(classHomeWork.homework._id),
                            onModel: "NormalHomework",
                            user: mongoose.Types.ObjectId(userIds)
                        });
                        if(a){
                            await HomeworkAssign.findByIdAndUpdate(a._id, { is_delete : false });
                        }
                        else{
                            await HomeworkAssign.create({
                                user: mongoose.Types.ObjectId(userIds),
                                class: mongoose.Types.ObjectId(classHomeWork.class),
                                homework: mongoose.Types.ObjectId(classHomeWork.homework._id),
                                onModel: 'NormalHomework'
                            }) 
                        }
                    }
                }
                if(reqAttachments.length > 0){
                    let newDocument = [];
                    let length = reqAttachments.length
                    for(let i = 0; i < length; i++){
                        const file = await File.findOne({ id_files: reqAttachments[i].id, is_delete: false });
                        newDocument.push(file._id);
                    }
                    await NormalHomework.findOneAndUpdate(
                        {_id: mongoose.Types.ObjectId(classHomeWork.homework._id)},
                        {
                            document: newDocument
                        },
                        {new: true}
                    );
                }
                else{
                    await NormalHomework.findOneAndUpdate(
                        {_id: mongoose.Types.ObjectId(classHomeWork.homework._id)},
                        {
                            document: []
                        },
                        {new: true}
                    );
                }
                if(req.files){
                    if(req.files.length> 0){
                        for(let i = 0; i < req.files.length; i++){
                            await FolerServices.uploadHomeworkTeacherFile(userId, classId, classHomeWork, req.files[i], classHomeWork.homework._id);
                        }
                    }
                }
                const homeworkUpdate = await NormalHomework.findOneAndUpdate(
                    { id_normal_homework: classHomeWork.homework.id_normal_homework, is_delete: false },
                    update,
                    { new : true }
                )
                .populate("homework_type", "-_id -__v")
                .populate("create_by", "-_id -__v -password")
                .populate("homework_category", "-_id -__v")
                .populate("document", "name viewLink downloadLink size id_files");
                
                let arrayStudentAssgined = await HomeworkAssign.find({ homework: mongoose.Types.ObjectId(classHomeWork.homework._id), class: mongoose.Types.ObjectId(classId) })
                .populate('user', '-__v, -password');
                let arrayStudentAssginedEmail = [];
                arrayStudentAssgined.forEach(student => {
                    arrayStudentAssginedEmail.push(student.user.email);
                });
                let data = JSON.parse(JSON.stringify(homeworkUpdate))
                data['student_assgined'] = arrayStudentAssginedEmail;
                return res.json({
                    success: true,
                    message: "Update homework successfully!",
                    data: data,
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
        catch(err){
            console.log(err);
            res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return
        }
    }
}

module.exports = new HomeWorkController;