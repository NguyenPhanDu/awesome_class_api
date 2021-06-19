const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const HomeworkType = require('../../models/HomeworkType');
const NormalHomework = require('../../models/NormalHomework');
const ClassMember = require('../../models/ClassMember');
const ClassHomework = require('../../models/ClassHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const SubmitHomework = require('../../models/SubmitHomework');
const FolerSer = require('../../services/file_and_folder/student_submit');
const moment = require('moment');
class SubmitHomeworkController{
    // id_class_homework
    // status : 1 là đúng hạn, 2 là trễ, 3 là thiếu, 4 là đã trả, 0 là đã giao
    submitHomework (req, res){
        try{
            const now = moment().toDate().toString();
            const user = await User.findOne({email: res.locals.email})
                let userId = user._id;
            const classHomework = await ClassHomework.findOne({id_class_homework: req.body.id_class_homework, is_delete: false})
            // .populate('class')
            // .populate('homework')
            let classId = classHomework.class;
            let homeworkId = classHomework.homework;
            const homeworkAssign = HomeworkAssign.findOne(
                {
                    user: mongoose.Types.ObjectId(userId),
                    homework: mongoose.Types.ObjectId(homeworkId),
                    class: mongoose.Types.ObjectId(classId),
                    is_delete: false,
                }
            ).populate('homework')
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
            await HomeworkAssign.findByIdAndUpdate(homeworkAssign._id,
                {
                    status: status,
                    is_submit: true
                }
            )
        }
        catch(err){
            console.log(err);
        }
    }
}

module.exports = new SubmitHomeworkController