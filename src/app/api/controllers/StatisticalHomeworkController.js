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
const Comment = require('../../models/Comment');

class StatisticalHomework{
    //1 api xài cho 2 loại hay sao ??
    // id_class_homework
    async statisticalHomework(req, res){
        try{
            const classHomework = await ClassHomework.findOne({id_class_homework: Number(req.body.id_class_homework), is_delete: false})
            .populate({
                path: 'homework',
                populate: [
                    {
                        path: 'create_by'
                    }
                ]
            })
            const allAssignHomework = await HomeworkAssign.find(
                { 
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework._id),
                    is_delete: false
                }
            ).populate('user', '-password')
            .populate('homework');
            
            let assignment = allAssignHomework;
            let amount_submitted = await HomeworkAssign.countDocuments(
                { 
                    is_delete: false,
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework._id),
                    is_submit: true
                }
            );
            let amount_delivered = await HomeworkAssign.countDocuments(
                { 
                    is_delete: false,
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework._id),
                    is_submit: false
                }
            );
            let total = await HomeworkAssign.countDocuments(
                { 
                    is_delete: false,
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework._id),
                }
            );
            let amount_returned = await HomeworkAssign.countDocuments(
                {
                    is_delete: false,
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework._id),
                    is_submit: true,
                    is_signed: true
                }
            );
            let response = {}
            response['total'] = total
            response['amount_submitted'] = amount_submitted;
            response['amount_returned'] = amount_returned;
            response['amount_delivered'] = amount_delivered;
            response['list_assignment'] = assignment;
            response['homework'] = classHomework.homework;
            return res.json({
                success: true,
                message: "Statistical homework homework!",
                data: response,
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
            return
        }
    }

    //req: id_class_homework, students:[{ email: , scores:  } ] 
    async returnHomework(req, res){
        try{
            const classHomework = await ClassHomework.findOne({id_class_homework: Number(req.body.id_class_homework), is_delete: false});
            for(let i = 0; i< req.body.students.length; i++){
                let user = await User.findOne( { email : req.body.students[i].email } )
                await HomeworkAssign.findOneAndUpdate(
                    {
                        is_delete: false,
                        class: mongoose.Types.ObjectId(classHomework.class),
                        homework: mongoose.Types.ObjectId(classHomework.homework),
                        user: mongoose.Types.ObjectId(user._id),
                        is_submit: true
                    },
                    {
                        is_signed: true,
                        scores: req.body.students[i].scores
                    }
                )
            }
            res.json({
                success: true,
                message: "sign homework submit successfully!",
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
    }
    // req.body: id_class_homework, id_homework_assign;
    async detailSubmitionOneStudent(req, res){
        try{
            const classHomework = await ClassHomework.findOne({id_class_homework: Number(req.body.id_class_homework), is_delete: false});
            let homeworkAssign = await HomeworkAssign.findOne(
                {
                    is_delete: false,
                    id_homework_assign: Number(req.body.id_homework_assign)
                }
            )
            .populate('user','-password');
            let comments = await Comment.find({ onModel: 'HomeworkAssign', is_delete: false, ref: mongoose.Types.ObjectId(homeworkAssign._id) })
            let result = JSON.parse(JSON.stringify(homeworkAssign));
            let submitted;
            const submit = await SubmitHomework.findOne(
                {
                    is_delete: false,
                    user: mongoose.Types.ObjectId(homeworkAssign.user._id),
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
            res.json({
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
    }
}

module.exports = new StatisticalHomework
