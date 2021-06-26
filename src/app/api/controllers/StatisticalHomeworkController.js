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

class StatisticalHomework{
    //1 api xài cho 2 loại hay sao ??
    // id_class_homework
    async statisticalHomework(req, res){
        try{
            const classHomework = await ClassHomework.findOne({id_class_homework: Number(req.body.id_class_homework), is_delete: false})
            .populate('homework');
            const allAssignHomework = await HomeworkAssign.find(
                { 
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework._id),
                    is_delete: false
                }
            ).populate('user', '-password')
            .populate('homework');
            // let result = JSON.parse(JSON.stringify(allAssignHomework));
            // let resultLength = result.length;
            // if(resultLength > 0){
            //     for(let i = 0; i < resultLength; i++){
            //         let submitted;
            //         const submit = await SubmitHomework.findOne(
            //             {
            //                 is_delete: false,
            //                 user: mongoose.Types.ObjectId(result[i].user._id),
            //                 assignment: mongoose.Types.ObjectId(result[i]._id),
            //                 class_homework: mongoose.Types.ObjectId(classHomework._id),
            //             }
            //         );
            //         if(submit){
            //             submitted = JSON.parse(JSON.stringify(submit));
        
            //             delete submitted.class_homework;
            //             delete submitted.user
            //             delete submitted.is_delete
            //             delete submitted.assignment
            //             delete submitted.updatedAt
            //             delete submitted.createdAt
            //         }
            //         else{
            //             submitted = null;
            //         }
            //         result[i].submitted = submitted;
            //     }
                
            // };
            let assignment = allAssignHomework;
            let amount_submitted = await HomeworkAssign.countDocuments(
                { 
                    is_delete: false,
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework._id),
                    is_submit: true
                }
            );
            let amout_delivered = await HomeworkAssign.countDocuments(
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
            // const a = await HomeworkAssign.find(
            //     {
            //         is_delete: false,
            //         class: mongoose.Types.ObjectId(classHomework.class),
            //         homework: mongoose.Types.ObjectId(classHomework.homework._id),
            //         is_submit: true
            //     }
            // ).populate('user', '-password');
            // let list_submitted = JSON.parse(JSON.stringify(a))
            // list_submitted.map(item => {
            //     item.user
            // })
            
            // const b = await HomeworkAssign.find(
            //     {
            //         is_delete: false,
            //         class: mongoose.Types.ObjectId(classHomework.class),
            //         homework: mongoose.Types.ObjectId(classHomework.homework._id),
            //         is_submit: false
            //     }
            // ).populate('user', '-password');
            // let list_delivered = JSON.parse(JSON.stringify(b));
            // list_delivered.map(item => {
            //     item.user
            // });
            let response = {}
            response['total'] = total
            response['amount_submitted'] = amount_submitted;
            response['amout_delivered'] = amout_delivered;
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

    //req: id_class_homework, students
    async returnHomework(req, res){
        try{
            const classHomework = await ClassHomework.findOne({id_class_homework: Number(req.body.id_class_homework), is_delete: false});
            for(let i = 0; i< req.body.students; i++){
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
                        status: 4,
                        scores: req.body.students[i].scores
                    }
                )
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
            return
        }
    }
    // req.body: id_homework_assign;
    async detailSubmitionOneStudent(req, res){
        try{
            let homeworkAssign = await HomeworkAssign.findOne(
                {
                    is_delete: false,
                    id_homework_assign: Number(req.body.id_homework_assign)
                }
            )
            .populate('user','-password');
            result = JSON.parse(JSON.stringify(homeworkAssign));
            let submitted;
            const submit = await SubmitHomework.findOne(
                {
                    is_delete: false,
                    user: mongoose.Types.ObjectId(homeworkAssign.user._id),
                    assignment: mongoose.Types.ObjectId(homeworkAssign._id),
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
