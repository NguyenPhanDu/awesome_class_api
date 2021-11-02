const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const HomeworkType = require('../../models/HomeworkType');
const MutilChoiceHomework = require('../../models/MutilChoiceHomework');
const ClassMember = require('../../models/ClassMember');
const ClassHomework = require('../../models/ClassHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const ClassRole = require('../../models/ClassRole');
const HomeworkCategory = require('../../models/HomeworkCategory');
const FolerServices = require('../../services/file_and_folder/index');
const File = require('../../models/File');
const NotificationController = require('./NotificationController');
const Test = require('../../models/Test')

// req.body.questions = [
//     {
//         title: "Câu hỏi 1",
//         options: [
//             "op1",
//             "op2",
//             "op3",
//             "op4"
//         ],
//         answer : 2,
//         scores: 5
//     }
// ];
async function create(req, res){
    try{
        console.log(req.body)
        let reqQuestions = await JSON.parse(req.body.questions)
        let reqStudent = await JSON.parse(req.body.emails);
        let reqCategory = await JSON.parse(req.body.category);
        console.log("reqCategoryreqCategoryreqCategoryreqCategory",reqCategory)
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
        const homeWorkType =  await HomeworkType.findOne({id_homework_type: 3});
        let homeWorkTypeId = homeWorkType._id;
        let listIdReceiver = [];
        //Vai trò của user trong class (tìm giáo viên chỉ giáo viên mới đc tạo)
        const classMember = await ClassMember.findOne({ user :  mongoose.Types.ObjectId(userId), class : mongoose.Types.ObjectId(classId)})
                                .populate('role');
        let userRole = classMember.role.id_class_role;
        if(userRole == 1 || userRole == 3){
            let homework = MutilChoiceHomework({
                title: req.body.title,
                description: req.body.description,
                start_date: req.body.start_date,
                deadline: req.body.deadline,
                total_scores: reqTotalScore,
                homework_type: mongoose.Types.ObjectId(homeWorkTypeId),
                create_by: mongoose.Types.ObjectId(userId),
                questions: reqQuestions
            });
            let newHomework = await homework.save();
            let classHomework = await ClassHomework.create({
                class: mongoose.Types.ObjectId(classId),
                homework: mongoose.Types.ObjectId(newHomework._id),
                onModel: 'MutilChoiceHomework'
            });
            if(req.files){
                if(req.files.length> 0){
                    for(let i = 0; i < req.files.length; i++){
                        await FolerServices.uploadFileCreateMutilChoiceHomeWork(userId, classId, classHomework,req.files[i], newHomework._id);
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
                        onModel: 'MutilChoiceHomework'
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
                console.log("gửi toàn bộ sinh viên trong lớp")
                let arrStudentInClass = await ClassMember.find({ class: mongoose.Types.ObjectId(classId), role: mongoose.Types.ObjectId(classRoleStudentId), is_delete: false, status: 1 })
                console.log("danh sách sinh viên: ");
                console.log(arrStudentInClass)
                if(arrStudentInClass.length > 0){
                    for(let i =0; i< arrStudentInClass.length; i++){
                        await HomeworkAssign.create({
                            user: mongoose.Types.ObjectId(arrStudentInClass[i].user),
                            class: mongoose.Types.ObjectId(classId),
                            homework: mongoose.Types.ObjectId(newHomework._id),
                            onModel: 'MutilChoiceHomework'
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
            const homeworkCreated = await MutilChoiceHomework.findById(newHomework._id)
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
}


async function edit(req, res){
    try{
        // mảng các receiver nhận notify
        let listReceiver = [];
        let reqQuestions = await JSON.parse(req.body.questions)
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
                questions: reqQuestions
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
                    questions: reqQuestions
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
                        onModel: "MutilChoiceHomework",
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
                        onModel: "MutilChoiceHomework",
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
                            onModel: 'MutilChoiceHomework'
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
                await MutilChoiceHomework.findOneAndUpdate(
                    {_id: mongoose.Types.ObjectId(classHomeWork.homework._id)},
                    {
                        document: newDocument
                    },
                    {new: true}
                );
            }
            else{
                //await FolerServices.deleteFileWhenUpdate(classHomeWork._id);
                await MutilChoiceHomework.findOneAndUpdate(
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
                        await FolerServices.uploadFileCreateMutilChoiceHomeWork(userId, classId, classHomeWork, req.files[i], classHomeWork.homework._id);
                    }
                }
            }
            const homeworkUpdate = await MutilChoiceHomework.findOneAndUpdate(
                { id_mutil_choice: classHomeWork.homework.id_mutil_choice, is_delete: false },
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

async function test(req, res){
    try{
        const questions = [
            {
                title: "Câu hỏi 1",
                options: [
                    "op1",
                    "op2",
                    "op3",
                    "op4"
                ],
                answer : 2,
                scores: 5
            }
        ];
        const a = await Test.create({
            questions: questions
        });
        res.json(a)
    }
    catch(err){
        console.log(err)
    }
}

module.exports = {
    test,
    create,
    edit
}