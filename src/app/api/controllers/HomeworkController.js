const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const HomeworkType = require('../../models/HomeworkType');
const NormalHomework = require('../../models/NormalHomework');
const MutilChoiceHomework = require('../../models/MutilChoiceHomework');
const ClassMember = require('../../models/ClassMember');
const ClassHomework = require('../../models/ClassHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const ClassRole = require('../../models/ClassRole');
const HomeworkCategory = require('../../models/HomeworkCategory');
const FolerServices = require('../../services/file_and_folder/index');
const Comment = require('../../models/Comment');
const File = require('../../models/File');
const NotificationController = require('./NotificationController');
const FavourateHomework = require('../../models/FavouriteHomework');
const moment = require('moment');
const { parseTimeFormMongo } = require('../../../helpers/parse_date');
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
            const classRoleStudent = await ClassRole.findOne({id_class_role : 2})
            let classRoleStudentId = classRoleStudent._id;
            const classRoleTeacher = await ClassRole.findOne({id_class_role : 1 });
            let classRoleTeacherId = classRoleTeacher._id;
            const user = await User.findOne({email: res.locals.email})
            let userId = user._id;
            const classs = await Class.findOne({id_class : Number(req.body.id_class)})
            let classId = classs._id
            const homeWorkType =  await HomeworkType.findOne({id_homework_type: 1});
            let homeWorkTypeId = homeWorkType._id;
            let listIdReceiver = [];
            //Vai trò của user trong class (tìm giáo viên chỉ giáo viên mới đc tạo)
            const classMember = await ClassMember.findOne({ user :  mongoose.Types.ObjectId(userId), class : mongoose.Types.ObjectId(classId)})
                                    .populate('role');
            let userRole = classMember.role.id_class_role;
            if(userRole == 1 || userRole == 3){
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
                if(req.files){
                    if(req.files.length> 0){
                        for(let i = 0; i < req.files.length; i++){
                            await FolerServices.uploadFileCreateHomeWork(userId, classId, classHomework,req.files[i], newHomework._id);
                        }
                    }
                }
                if(reqStudent.length > 0){
                    let arrayUserId = [];
                    for(let i = 0; i < reqStudent.length; i++){
                        let user =  await User.findOne({email: reqStudent[i] })
                        arrayUserId.push(user._id);
                        listIdReceiver.push(user._id);
                    }
                    for(let i = 0; i< arrayUserId.length; i++){
                        await HomeworkAssign.create({
                            user: mongoose.Types.ObjectId(arrayUserId[i]),
                            class: mongoose.Types.ObjectId(classId),
                            homework: mongoose.Types.ObjectId(newHomework._id),
                            onModel: 'NormalHomework'
                        });
                    }
                    // giáo viên trong lớp trừ bản thân
                    const allTeacherInClass = await ClassMember.find({ class: mongoose.Types.ObjectId(classId), role: mongoose.Types.ObjectId(classRoleTeacherId) ,user: { $ne: mongoose.Types.ObjectId(userId) } });
                    JSON.parse(JSON.stringify(allTeacherInClass));
                    // push vào mảng học sinh
                    for(let i = 0; i < allTeacherInClass.length; i++){
                        listIdReceiver.push(allTeacherInClass[i].user);
                    }
                }
                else{
                    let arrStudentInClass = await ClassMember.find({ class: mongoose.Types.ObjectId(classId), role: mongoose.Types.ObjectId(classRoleStudentId), is_delete: false, status: 1 })
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
                    // tất cả thành viên trong class trừ bản thân
                    let allMemberInClass = await ClassMember.find({ class: mongoose.Types.ObjectId(classId), user: { $ne: mongoose.Types.ObjectId(userId) } });
                    JSON.parse(JSON.stringify(allMemberInClass));
                    listIdReceiver  = allMemberInClass.map(item => {
                        return item.user
                    });

                };

                if(reqCategory != null){
                    console.log("có category")
                    if(reqCategory.id_homework_category == -1){
                      const newCategory = await HomeworkCategory.create(
                          {
                            title: reqCategory.title,
                            user: res.locals._id,
                            class: classId
                          }
                      );
                      console.log("New catagory", newCategory)
                      const test = await NormalHomework.findOneAndUpdate({ _id: newHomework._id }, { homework_category: newCategory._id },{ new: true })
                      console.log(test)
                    }
                    else{
                        console.log("Old category")
                        const category = await HomeworkCategory.findOne({ id_homework_category: reqCategory.id_homework_category, is_delete: false });
                        const test = await NormalHomework.findOneAndUpdate({ _id: newHomework._id }, { homework_category: category._id }, { new: true});
                        console.log(test)
                    }
                }
                
                const homeworkCreated = await NormalHomework.findById(newHomework._id)
                                .populate("homework_type", "-_id -__v")
                                .populate("create_by", "-_id -__v -password")
                                .populate("homework_category", "-_id -__v")
                                .populate("document", "name viewLink downloadLink size id_files");
                res.json({
                    success: true,
                    message: "Create homework successfull!",
                    data: homeworkCreated,
                    res_code: 200,
                    res_status: "CREATE_SUCCESSFULLY"
                });
                
                await NotificationController.exerciseNotify(classHomework._id, userId, listIdReceiver, 1);
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
                homeworkModel = MutilChoiceHomework;
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
            const classss = await Class.findOne({_id: mongoose.Types.ObjectId(classHomeWork.class)})
            if(classHomeWork.homework.create_by.email == res.locals.email || classss.admin == res.locals._id){
                await ClassHomework.findOneAndUpdate(
                    {id_class_homework: req.body.id_class_homework, is_delete: false},
                    { is_delete : true },
                    {new: true}
                );
                await FavourateHomework.updateMany({ class_homework: mongoose.Types.ObjectId(classHomeWork.homework._id) }, { is_delete : true })
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
            console.log(err)
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
                homeworkModel = MutilChoiceHomework;
            }
            const classHomework = await ClassHomework.findOne({id_class_homework: req.body.id_class_homework, is_delete: false}).populate('class')
            let homeworkId = classHomework.homework;
            const arrayCommet = await Comment.find({ onModel: 'ClassHomework', is_delete: false, ref: mongoose.Types.ObjectId(classHomework._id) })
            .populate('user', '-password');
            let homeworkNoAssigned = await homeworkModel.findOne({_id : mongoose.Types.ObjectId(homeworkId)})
                .populate('homework_category',"title id_homework_category")
                .populate('homework_type',"name id_homework_type")
                .populate('create_by', "-password")
                .populate("document", "name viewLink downloadLink size id_files");
            let arrayStudentAssgined = await HomeworkAssign.find({ homework: mongoose.Types.ObjectId(homeworkNoAssigned._id), is_delete: false })
                                                .populate('user', '-__v, -password');
            let arrayStudentAssginedEmail = [];
            arrayStudentAssgined.forEach(student => {
                arrayStudentAssginedEmail.push(student.user.email);
            });

            let finalResult = JSON.parse(JSON.stringify(homeworkNoAssigned));
            finalResult['student_assgined'] = arrayStudentAssginedEmail;
            finalResult['comments'] = arrayCommet;
            finalResult['id_class_homework'] = classHomework.id_class_homework;
            finalResult['id_class'] = classHomework.class.id_class
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
        try{
            let list  = [];
            const user = await User.findOne({email: res.locals.email})
            let user_id = user._id
            // user tạo
            const arrHomework = await ClassHomework.find({is_delete: false})
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
            });
            let homeworksParte = JSON.parse(JSON.stringify(arrHomework));
            if(homeworksParte.length > 0){
                homeworksParte = homeworksParte.filter(homework => {
                    return homework.homework.create_by != null
                });
                for(let i = 0; i < homeworksParte.length; i++){
                    let a = await ClassMember.findOne(
                        { 
                            user: mongoose.Types.ObjectId(user_id), 
                            class: mongoose.Types.ObjectId(homeworksParte[i].class),
                            is_delete: true
                        })
                    if(!a){
                        const amoutFavourate = await FavourateHomework.countDocuments({ class_homework: homeworksParte[i]._id, is_delete: false });
                        homeworksParte[i].amountBookMark = amoutFavourate;
                        const mark = await FavourateHomework.findOne({class_homework: homeworksParte[i]._id, user: res.locals._id, is_delete: false })
                        if(mark){
                            homeworksParte[i].bookMark = true;
                        }
                        else{
                            homeworksParte[i].bookMark = false;
                        }
                        const comments = await Comment.countDocuments(
                            {
                                onModel : 'ClassHomework',
                                ref: homeworksParte[i]._id,
                                is_delete: false
                            }
                        )
                        homeworksParte[i].amountComment = comments
                        list.push(homeworksParte[i]);
                    }
                }
            }
            
            const arrHomeworkAssgin = await HomeworkAssign.find({user: mongoose.Types.ObjectId(user_id), is_delete: false})
            
            let lenght = arrHomeworkAssgin.length;
            if(lenght > 0){
                for(let i = 0 ; i< lenght; i++){
                    let a = await ClassHomework.findOne({ homework: mongoose.Types.ObjectId(arrHomeworkAssgin[i].homework) , is_delete: false},)
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
                    
                    if(a){
                        const amoutFavourate = await FavourateHomework.countDocuments({ class_homework: a._id, is_delete: false });
                        a.amountBookMark = amoutFavourate;
                        const mark = await FavourateHomework.findOne({class_homework: a._id, user: res.locals._id, is_delete: false })
                        if(mark){
                            a.bookMark = true;
                        }
                        else{
                            a.bookMark = false;
                        }
                        const comments = await Comment.countDocuments(
                            {
                                onModel : 'ClassHomework',
                                ref: a._id,
                                is_delete: false
                            }
                        )
                        a.amountComment = comments
                        let homeworksParte = JSON.parse(JSON.stringify(a));
                        list.push(homeworksParte)
                    }
                }
            }

            const sortListHomework  = list.sort((a,b) => moment(parseTimeFormMongo(b.createdAt), "YYYY-MM-DD HH:mm:ss") - moment(parseTimeFormMongo(a.createdAt), "YYYY-MM-DD HH:mm:ss"));
            return res.json({
                success: true,
                message: "get all homework successfull!",
                data: sortListHomework,
                res_code: 200,
                res_status: "CREATE_SUCCESSFULLY"
            })
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

    // Req: homework_type : (1, 2, 3), id_class_homework, title, description, deadline, start_date, total_scores, category : { title, id_homework_category}, emails[];
    async updateNormalHomework(req, res){
        // Req:  id_class, title, description, deadline, start_date, total_scores, category : { title, id_homework_category}, emails[];
        try{
            console.log(req.body)
            // mảng các receiver nhận notify
            let listReceiver = [];
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
            const classRoleTeacher = await ClassRole.findOne({id_class_role : 1 });
            let classRoleTeacherId = classRoleTeacher._id;
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
                if(reqStudent.length > 0 ){
                    // giáo viên trong lớp trừ bản thân
                    const allTeacherInClass = await ClassMember.find({ class: mongoose.Types.ObjectId(classId), role: mongoose.Types.ObjectId(classRoleTeacherId) ,user: { $ne: mongoose.Types.ObjectId(userId) } });
                    JSON.parse(JSON.stringify(allTeacherInClass));
                    // push vào mảng học sinh
                    for(let i = 0; i < allTeacherInClass.length; i++){
                        listReceiver.push(allTeacherInClass[i].user);
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
                            listReceiver.push(a.user);
                        }
                        else{
                            const b = await HomeworkAssign.create({
                                user: mongoose.Types.ObjectId(userIds),
                                class: mongoose.Types.ObjectId(classHomeWork.class),
                                homework: mongoose.Types.ObjectId(classHomeWork.homework._id),
                                onModel: 'NormalHomework'
                            })
                            listReceiver.push(b.user);
                        }
                    }
                }
                let allMemberInClass = await ClassMember.find({ class: mongoose.Types.ObjectId(classId), user: { $ne: mongoose.Types.ObjectId(userId) } });
                JSON.parse(JSON.stringify(allMemberInClass));
                listReceiver  = allMemberInClass.map(item => {
                    return item.user
                });
                // else{
                //     let arrLength = reqStudent.length
                //     for(let i = 0; i<arrLength;i++ ){
                //         let ddd = await User.findOne({email: reqStudent[i]})
                //         let userIds = ddd._id;
                //         let a = await HomeworkAssign.findOne({
                //             class: mongoose.Types.ObjectId(classHomeWork.class),
                //             homework: mongoose.Types.ObjectId(classHomeWork.homework._id),
                //             onModel: "NormalHomework",
                //             user: mongoose.Types.ObjectId(userIds)
                //         });
                //         if(a){
                //             await HomeworkAssign.findByIdAndUpdate(a._id, { is_delete : false });
                //             //await NotificationController.createUpdateHomeworkNotify(classId, classHomework._id, userId, userIds)

                //         }
                //         else{
                //             await HomeworkAssign.create({
                //                 user: mongoose.Types.ObjectId(userIds),
                //                 class: mongoose.Types.ObjectId(classHomeWork.class),
                //                 homework: mongoose.Types.ObjectId(classHomeWork.homework._id),
                //                 onModel: 'NormalHomework'
                //             })
                //             //await NotificationController.createUpdateHomeworkNotify(classId, classHomework._id, userId, userIds)
                //         }
                //     }
                // }
                if(reqAttachments.length > 0){
                    let newDocument = [];
                    await FolerServices.deleteFileWhenUpdate(classHomeWork._id);
                    let length = reqAttachments.length
                    for(let i = 0; i < length; i++){
                        const file = await File.findOneAndUpdate({ id_files: reqAttachments[i].id}, { is_delete: false }, { new: true});
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
                    //await FolerServices.deleteFileWhenUpdate(classHomeWork._id);
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
                            await FolerServices.uploadFileCreateHomeWork(userId, classId, classHomeWork, req.files[i], classHomeWork.homework._id);
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
                res.json({
                    success: true,
                    message: "Update homework successfully!",
                    data: data,
                    res_code: 200,
                    res_status: "UPDATE_SUCCESSFULLY"
                });
                await NotificationController.exerciseNotify(classHomeWork._id, userId, listReceiver, 2);
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