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
            const classHomework = await ClassHomework.findOne({id_class_homework: Number(req.body.id_class_homework), is_delete: false});
            const allAssignHomework = await HomeworkAssign.find(
                { 
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework),
                    is_delete: false
                }
            ).populate('user', '-password')
            .populate('homework');
            let result = JSON.parse(JSON.stringify(allAssignHomework));
            let resultLength = result.length;
            if(resultLength > 0){
                for(let i = 0; i < resultLength; i++){
                    let submitted;
                    const submit = await SubmitHomework.findOne(
                        {
                            is_delete: false,
                            user: mongoose.Types.ObjectId(result[i].user._id),
                            assignment: mongoose.Types.ObjectId(result[i]._id),
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
                    result[i].submitted = submitted;
                }
                
            };
            let assignment = result;
            let amount_submitted = await HomeworkAssign.countDocuments(
                { 
                    is_delete: false,
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework),
                    is_submit: true
                }
            );
            let amout_delivered = await HomeworkAssign.countDocuments(
                { 
                    is_delete: false,
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework),
                    is_submit: false
                }
            );
            const a = await HomeworkAssign.find(
                {
                    is_delete: false,
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework),
                    is_submit: true
                }
            ).populate('user', '-password');
            let list_submitted = JSON.parse(JSON.stringify(a))
            list_submitted.map(item => {
                return item.user
            })
            
            const b = await HomeworkAssign.find(
                {
                    is_delete: false,
                    class: mongoose.Types.ObjectId(classHomework.class),
                    homework: mongoose.Types.ObjectId(classHomework.homework),
                    is_submit: false
                }
            ).populate('user', '-password');
            let list_delivered = JSON.parse(JSON.stringify(b));
            list_delivered.map(item => {
                return item.user
            });
            let response = {}
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

