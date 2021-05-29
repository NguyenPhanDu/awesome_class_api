const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const HomeworkType = require('../../models/HomeworkType');
const NormalHomework = require('../../models/NormalHomework');
const ClassMember = require('../../models/ClassMember');
const ClassHomework = require('../../models/ClassHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const ClassRole = require('../../models/ClassRole');

class HomeWorkController{
    // Req:  id_class, title, description, deadline, start_date
    async createNormalHomework(req, res){
        let homeworkId;
        let classRoleStudentId;
        await ClassRole.findOne({id_class_role : 2})
            .then(classRole => {
                classRoleStudentId = classRole._id;
            })
        let userId;
        await User.findOne({email: res.locals.email})
            .then(user => {
                userId = user._id;
            })
        let classId;
        await Class.findOne({id_class : Number(req.body.id_class)})
            .then(classs => {
                classId = classs._id
            })
        // Vai trò của user trong class
        let userRole;
        await ClassMember.findOne({ user :  mongoose.Types.ObjectId(userId), class : mongoose.Types.ObjectId(classId)})
                .populate('role')
                .then(classMember => {
                    userRole = classMember.role.id_class_role;
                });
        if(userRole == 1){
            let homeWorkTypeId;
        await HomeworkType.findOne({id_homework_type: 1})
                .then(homeWorkType => {
                    homeWorkTypeId = homeWorkType._id
                })
        const newHomework = NormalHomework({
            title: req.body.title,
            description: req.body.description,
            start_date: req.body.start_date,
            deadline: req.body.deadline,
            homework_type: mongoose.Types.ObjectId(homeWorkTypeId),
            create_by: mongoose.Types.ObjectId(userId)
        });
        await newHomework.save()
            .then(async homework => {
                homeworkId = homework._id
                await ClassHomework.create({
                    class: mongoose.Types.ObjectId(classId),
                    homework: mongoose.Types.ObjectId(homework._id),
                    onModel: 'NormalHomework'
                })
                .then(result => {
                })
                .catch(err => {
                    return res.json({
                        success: false,
                        message: 'Server error. Please try again. create class homework failed',
                        error: err,
                        res_code: 500,
                        res_status: "SERVER_ERROR"
                    });
                });
                // Trường hợp tất cả học sinh
                // 1 tìm tất cả user học sinh trong class đó : find [ _id user ] tìm trong classMember;
                // for list user vừa nhận mỗi lần lập tạo ra 1 Homeasgin với user là id đó
                await ClassMember.find({ class: mongoose.Types.ObjectId(classId), role: mongoose.Types.ObjectId(classRoleStudentId) })
                    .then(classMember => {
                        for(let i =0; i< classMember.length; i++){
                            HomeworkAssign.create({
                                user: mongoose.Types.ObjectId(classMember[i].user),
                                class: mongoose.Types.ObjectId(classId),
                                homework: mongoose.Types.ObjectId(homework._id),
                                onModel: 'NormalHomework'
                            })
                        };
                    })
                    .catch(err => {
                        return res.json({
                            success: false,
                            message: 'Server error. Please try again. create homework assign failed',
                            error: err,
                            res_code: 500,
                            res_status: "SERVER_ERROR"
                        });
                    });
            })
            .then((homework)=>{
                NormalHomework.findById(homeworkId)
                    .populate("homework_type", "-_id -__v")
                    .populate("create_by", "-_id -__v")
                    .then(result => {
                        return res.json({
                            success: true,
                            message: "Create homework successfull!",
                            data: result,
                            res_code: 200,
                            res_status: "CREATE_SUCCESSFULLY"
                        })
                    })
            })
            .catch(err => {
                return res.json({
                    success: false,
                    message: 'Server error. Please try again. create homework failed',
                    error: err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            });
        }
        else{
            return res.json({
                success: false,
                message: "No access",
                res_code: 403,
                res_status: "NO_ACCESS"
            })
        }
        
    };
    // Req: 
    async deleteHomework(req, res){

    }
}

module.exports = new HomeWorkController;