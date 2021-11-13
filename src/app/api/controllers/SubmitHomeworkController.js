const mongoose = require('mongoose');
const User = require('../../models/User');
const ClassHomework = require('../../models/ClassHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const SubmitHomework = require('../../models/SubmitHomework');
const FolerSer = require('../../services/file_and_folder/index');
const File = require('../../models/File');
const moment = require('moment');
const TimeHelper = require('../../../helpers/parse_date');
const Comment = require('../../models/Comment');
const ClassMember = require('../../models/ClassMember');
const ClassRole = require('../../models/ClassRole');
const HistorySubmit = require('../../models/HistorySubmit');

class SubmitHomeworkController{
    // id_class_homework
    // status : 1 là đúng hạn, 2 là trễ, 3 là thiếu, 0 là đã giao;
    // hàm này xài cho cả bài tập thường và bài tập trắc nghiệm
    async submitNormalHomework (req, res){
        try{
            const now = moment().toDate().toString();
            const reqAnswers = await JSON.parse(req.body.answers);
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
                answers: reqAnswers
            });

            const submit = await submitHomeworkSchema.save();

            if(req.files){
                if(req.files.length> 0){
                    for(let i = 0; i < req.files.length; i++){
                        await FolerSer.uploadFileSubmit(classId,user._id, req.files[i],submit._id);
                    }
                }
            }
            let status;
            if(homeworkAssign.homework.deadline){
                if( moment(TimeHelper.changeTimeInDBToISOString(submit.submit_at)).isBefore(TimeHelper.changeTimeInDBToISOString(homeworkAssign.homework.deadline))){
                    status = 1;
                }
                else{
                    status = 2;
                }
            }
            else{
                status = 1;
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
            const classRole  = await ClassRole.findOne({id_class_role: 1})
            let teacherRole_id = classRole._id
            const classHomework = await ClassHomework.findOne({id_class_homework: Number(req.body.id_class_homework), is_delete: false})
            .populate({
                path: 'homework',
                populate: [
                    {
                        path: 'create_by'
                    }
                ]
            });
            let classId = classHomework.class;
            let homeworkId = classHomework.homework._id;
            let result;
            const classMember = await ClassMember.findOne({ class: mongoose.Types.ObjectId(classId), user: mongoose.Types.ObjectId(userId), is_delete: false })
            if(classHomework.homework.create_by.email == res.locals.email || classMember.role.toString() == teacherRole_id.toString()){
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
                let comments = await Comment.find({ onModel: 'HomeworkAssign', is_delete: false, ref: mongoose.Types.ObjectId(homeworkAssign._id) })
                .populate('user', '-password'); 
                result = JSON.parse(JSON.stringify(homeworkAssign));
                let submitted;
                if(classHomework.homework.deadline && moment(TimeHelper.changeTimeInDBToISOString(now)).isAfter(TimeHelper.changeTimeInDBToISOString(classHomework.homework.deadline)) && homeworkAssign.is_submit == false){
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
                )
                .populate("document", "name viewLink downloadLink size id_files");
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
                result['comments'] = comments;
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
                        _id : mongoose.Types.ObjectId(document[i])
                    },
                    {
                        is_delete: true
                    }
                )
            };
            await SubmitHomework.findOneAndUpdate(
                {_id: mongoose.Types.ObjectId(sumitUserWantCancel._id) },
                { 
                    is_delete: true,
                },
                {
                    new: true
                }
            )
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

    // req.body.id_submit
    async updateSubmit(req, res){
        try{
            reqAttachments = JSON.parse(req.body.attachments);
            const now = moment().toDate().toString();
            const presentSubmit = await SubmitHomework.findOne({ id_submit_homework: req.body.id_submit, is_delete: false })
            .populate('class_homework')

            const history = await HistorySubmit.create(
                {
                    user: presentSubmit.user,
                    class_homework: presentSubmit.class_homework._id,
                    content: presentSubmit.content,
                    assignment: presentSubmit.assignment,
                    submit_at: presentSubmit.submit_at,
                    document: presentSubmit.document,
                    answers: presentSubmit.answers,
                    id_submit_homework: presentSubmit.id_submit_homework,
                    submit_at: now
                }
            )
            
            if(reqAttachments.length > 0){
                let newDocument = [];
                await FolerServices.deleteFileWhenUpdate(presentSubmit._id);
                let length = reqAttachments.length
                for(let i = 0; i < length; i++){
                    const file = await File.findOneAndUpdate({ id_files: reqAttachments[i].id_files}, { is_delete: false }, { new: true});
                    newDocument.push(file._id);
                }
                await SubmitHomework.findOneAndUpdate(
                    {_id: mongoose.Types.ObjectId(presentSubmit._id)},
                    {
                        document: newDocument
                    },
                    {new: true}
                );
            }
            else{
                //await FolerServices.deleteFileWhenUpdate(classHomeWork._id);
                await SubmitHomework.findOneAndUpdate(
                    {_id: mongoose.Types.ObjectId(presentSubmit._id)},
                    {
                        document: []
                    },
                    {new: true}
                );
            }
            if(req.files){
                if(req.files.length> 0){
                    for(let i = 0; i < req.files.length; i++){
                        await FolerSer.uploadFileSubmit(presentSubmit.class_homework.class,presentSubmit.user, req.files[i],presentSubmit._id);
                    }
                }
            }

            const reqAnswers = await JSON.parse(req.body.answers);
            const reqContent = await JSON.parse(req.body.content)
            const submit = await SubmitHomework.findOneAndUpdate(
                {
                    id_submit_homework: req.body.id_submit,
                    is_delete: false
                },
                {
                    answers: reqAnswers,
                    content: reqContent
                },
                {
                    new: true
                }
            )
            .populate('class_homework')
            .populate('assignment')
            .populate('user', '-password')
            .populate("document", "name viewLink downloadLink size id_files");

            let getSubmitObject = JSON.parse(JSON.stringify(submit));

            delete getSubmitObject.class_homework;
            delete getSubmitObject.user
            delete getSubmitObject.is_delete
            delete getSubmitObject.assignment
            delete getSubmitObject.updatedAt
            delete getSubmitObject.createdAt

            const homeworkAssignAfterUpdate = await HomeworkAssign.findOne(
                {
                    _id: mongoose.Types.ObjectId(submit.assignment._id)
                }
            )
            .populate('user','-password');
            let result = JSON.parse(JSON.stringify(homeworkAssignAfterUpdate));
            result['submitted'] = getSubmitObject
            result['is_author'] = false;
            return res.json({
                success: true,
                message: "Update your submit homework successfully!",
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
    }
}

module.exports = new SubmitHomeworkController