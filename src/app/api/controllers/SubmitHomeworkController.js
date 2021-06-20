const mongoose = require('mongoose');
const User = require('../../models/User');
const ClassHomework = require('../../models/ClassHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const SubmitHomework = require('../../models/SubmitHomework');
const FolerSer = require('../../services/file_and_folder/student_submit');
const File = require('../../models/File');
const FolderHomework = require('../../models/FolderHomework');
const Folder = require('../../models/Folder');
const moment = require('moment');
class SubmitHomeworkController{
    // id_class_homework
    // status : 1 là đúng hạn, 2 là trễ, 3 là thiếu, 4 là đã trả, 0 là đã giao;
    async submitNormalHomework (req, res){
        try{
            const now = moment().toDate().toString();
            const user = await User.findOne({email: res.locals.email})
            let userId = user._id;
            const classHomework = await ClassHomework.findOne({id_class_homework: Number(req.body.id_class_homework), is_delete: false})
            let classId = classHomework.class;
            let homeworkId = classHomework.homework;
            const homeworkAssign = await HomeworkAssign.findOne(
                {
                    user: mongoose.Types.ObjectId(userId),
                    homework: mongoose.Types.ObjectId(homeworkId),
                    class: mongoose.Types.ObjectId(classId),
                    is_delete: false,
                }
            ).populate('homework');

            const submitHomeworkSchema = new SubmitHomework({
                user: mongoose.Types.ObjectId(userId),
                class_homework: mongoose.Types.ObjectId(classHomework._id),
                content: req.body.content,
                assignment: mongoose.Types.ObjectId(homeworkAssign._id),
                submit_at: now,
            });

            const submit = await submitHomeworkSchema.save();

            await FolerSer.createStudentSubmit(classId,classHomework,user);

            if(req.files){
                if(req.files.length> 0){
                    for(let i = 0; i < req.files.length; i++){
                        await FolerSer.uploadFileSubmit(classId,classHomework,user, req.files[i],submit);
                    }
                }
            }
            let status;
            if( moment(submit).isBefore(homeworkAssign.homework.deadline) ){
                status = 1;
            }
            else{
                status = 2;
            }
            const homeworkAssignAfterUpdate = await HomeworkAssign.findOneAndUpdate(
                {
                    _id: mongoose.Types.ObjectId(homeworkAssign._id)
                },
                {
                    status: status,
                    is_submit: true
                },
                {
                    new: true
                }
            )
            .populate('user','-password');
            const data = await SubmitHomework.findById(mongoose.Types.ObjectId(submit._id))
            .populate('class_homework')
            .populate('assignment')
            .populate('user', '-password')
            .populate("document", "name viewLink downloadLink size id_files");
            let getSubmitObject = JSON.parse(JSON.stringify(data));

            delete getSubmitObject.class_homework;
            delete getSubmitObject.user
            delete getSubmitObject.is_delete
            delete getSubmitObject.assignment
            delete getSubmitObject.updatedAt
            delete getSubmitObject.createdAt
            
            let result = JSON.parse(JSON.stringify(homeworkAssignAfterUpdate));
            result['submitted'] = getSubmitObject
            result['is_author'] = false;
            return res.json({
                success: true,
                message: "Submit homework successfully!",
                data: result,
                res_code: 200,
                res_status: "SUBMIT_SUCCESSFULLY"
            });
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
    // id_class_homework
    async displaySubmitInDetailHomework(req, res){
        try{
            const now = moment().toDate().toString();
            const user = await User.findOne({email: res.locals.email})
            let userId = user._id;
            const classHomework = await ClassHomework.findOne({id_class_homework: Number(req.body.id_class_homework), is_delete: false})
            .populate({
                path: 'homework',
                populate: [
                    {
                        path: 'create_by'
                    }
                ]
            })
            let classId = classHomework.class;
            let homeworkId = classHomework.homework._id;
            let result;
            if(classHomework.homework.create_by.email == res.locals.email){
                let amount_submitted = await HomeworkAssign.countDocuments(
                    { 
                        is_delete: false,
                        class: mongoose.Types.ObjectId(classId),
                        homework: mongoose.Types.ObjectId(homeworkId),
                        is_submit: true
                    }
                );
                let total = await HomeworkAssign.countDocuments(
                    { 
                        is_delete: false,
                        class: mongoose.Types.ObjectId(classId),
                        homework: mongoose.Types.ObjectId(homeworkId),
                    }
                );
                result = {
                    is_author: true,
                    amount_submitted: amount_submitted,
                    total: total
                }
            }
            else{
                let homeworkAssign = await HomeworkAssign.findOne(
                    {
                        is_delete: false,
                        user: mongoose.Types.ObjectId(userId),
                        homework: mongoose.Types.ObjectId(homeworkId),
                    }
                )
                .populate('user','-password');
                result = JSON.parse(JSON.stringify(homeworkAssign));
                let submitted;
                if( moment(now).isAfter(classHomework.homework.deadline) && homeworkAssign.is_submit == false){
                    const homeworkAssign2 = await HomeworkAssign.findOneAndUpdate(
                        {
                            _id : mongoose.Types.ObjectId(homeworkAssign._id)
                        },
                        {
                            status: 3
                        },
                        {
                            new: true
                        }
                    )
                    .populate('user','-password');
                    result = JSON.parse(JSON.stringify(homeworkAssign2));
                }
                const submit = await SubmitHomework.findOne(
                    {
                        is_delete: false,
                        user: mongoose.Types.ObjectId(userId),
                        assignment: mongoose.Types.ObjectId(homeworkAssign._id),
                        class_homework: mongoose.Types.ObjectId(classHomework._id),
                    }
                );
                if(submit){
                    submitted = JSON.parse(JSON.stringify(submit));
                    delete submitted.class_homework;
                    delete submitted.user
                    delete submitted.is_delete
                    delete submitted.assignment
                    delete submitted.updatedAt
                    delete submitted.createdAt
                }
                else{
                    submitted = null;
                }
                result['submitted'] = submitted;
                result['is_author'] = false;
            }
            return res.json({
                success: true,
                message: "Get detail submit successfully!",
                data: result,
                res_code: 200,
                res_status: "GET_SUCCESSFULLY"
            });
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
            return
        }
    };
    // id_class_homework
    async cancelSubmit(req, res){
        try{
            const user = await User.findOne({email: res.locals.email})
            let userId = user._id;
            const classHomework = await ClassHomework.findOne({id_class_homework: Number(req.body.id_class_homework), is_delete: false})
            const sumitUserWantCancel = await SubmitHomework.findOne(
                {
                    user: mongoose.Types.ObjectId(userId),
                    class_homework: mongoose.Types.ObjectId(classHomework._id),
                    is_delete: false
                },
            );
            await HomeworkAssign.findOneAndUpdate(
                {
                    _id : mongoose.Types.ObjectId(sumitUserWantCancel.assignment),
                    is_delete: false
                },
                {
                    status: 0,
                    is_submit: false,
                },
                {
                    new: true
                }
            )
            // Xóa các file trong document
            const submitDocument = sumitUserWantCancel.document
            const document = JSON.parse(JSON.stringify(submitDocument));
            const arrayDocumentLength = document.length;
            for(let i = 0; i < arrayDocumentLength; i++){
                await File.findOneAndUpdate(
                    {
                        is_delete: false,
                        level: 6,
                        type: 1,
                        _id : mongoose.Types.ObjectId(document[i])
                    },
                    {
                        is_delete: true
                    }
                )
            };

            // Xóa foderHomework and Folder,
            const foderHomework =  await FolderHomework.findOneAndUpdate(
                {
                    is_delete: false,
                    level: 5,
                    type: 1,
                    class_homework: mongoose.Types.ObjectId(sumitUserWantCancel.class_homework),
                    create_by: mongoose.Types.ObjectId(sumitUserWantCancel.user),
                },
                {
                    is_delete: true
                },
                {
                    new: true
                }
            );
            await Folder.findOneAndUpdate(
                {
                    is_delete: false,
                    _id: mongoose.Types.ObjectId(foderHomework.folder)
                },
                {
                    is_delete: true
                }
            );
            const data = SubmitHomework.findOneAndUpdate(
                {_id: mongoose.Types.ObjectId(sumitUserWantCancel._id) },
                { 
                    // submit_at: '',
                    // content: '',
                    // document: [],
                    is_delete: true,
                },
                {
                    new: true
                }
            )
            .populate('class_homework')
            .populate('assignment')
            .populate('user', '-password')
            .populate("document", "name viewLink downloadLink size id_files");
            let dataObject = JSON.parse(JSON.stringify(data));
            delete dataObject.class_homework;
            delete dataObject.user
            delete dataObject.is_delete
            return res.json({
                success: true,
                message: "Cancel submit homework successfully!",
                res_code: 200,
                res_status: "DELETE_SUCCESSFULLY"
            });
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

module.exports = new SubmitHomeworkController