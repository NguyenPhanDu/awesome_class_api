const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const HomeworkType = require('../../models/HomeworkType');
const NormalHomework = require('../../models/NormalHomework');
const ClassMember = require('../../models/ClassMember');
const ClassHomework = require('../../models/ClassHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const ClassRole = require('../../models/ClassRole');

class ClassHomeworkController{
    async getAllClassHomework(req, res){
        let classId;
        await Class.findOne({id_class : Number(req.body.id_class)})
            .then(classs => {
                classId = classs._id
            })
        await ClassHomework.find({class: mongoose.Types.ObjectId(classId)})
            .populate({
                path: 'homework',
                populate: {
                    path: 'homework_type',
                    select:['name','id_homework_type']
                }
            })
            .then(classmem => {
                let newArray = classmem.map(classs => {
                    return classs.homework
                })
                res.json({
                    success: true,
                    message: "get all homework successfull!",
                    data: newArray,
                    res_code: 200,
                    res_status: "GET_SUCCESSFULLY"
                })
            })
            .catch(error => {
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: error,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
    }
}   

module.exports = new ClassHomeworkController
