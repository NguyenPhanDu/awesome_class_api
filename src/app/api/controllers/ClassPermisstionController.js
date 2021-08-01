const mongoose = require('mongoose');
const TeacherPermisstion = require('../../models/TeacherPermisstion');
const StudentPermisstion = require('../../models/StudentPermisstion');
const Class = require('../../models/Class');
const ClassMember = require('../../models/ClassMember');
class ClassPermission{
    // req: id_class
    async showStudentPermissyionInClass(req, res){
        try{
            const classes = await Class.findOne({ id_class: Number(req.body.id_class) })
            let classId = classes._id;
            const studentPermisstion = await StudentPermisstion.findOne({ class: mongoose.Types.ObjectId(classId), is_delete: false });
            return res.json({
                success: true,
                message: "get student permisstion successfull!",
                data: studentPermisstion,
                res_code: 200,
                res_status: "GET_SUCCESSFULLY"
            })
        }
        catch(err){
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        }
    }
    //req: id_class
    async showTeacherPermisstionInClass(req, res){
        try{
            const classes = await Class.findOne({ id_class: Number(req.body.id_class) })
            let classId = classes._id;
            const teacherPermisstion = await TeacherPermisstion.findOne({ class: mongoose.Types.ObjectId(classId), is_delete: false });
            return res.json({
                success: true,
                message: "get teacher permisstion successfull!",
                data: teacherPermisstion,
                res_code: 200,
                res_status: "GET_SUCCESSFULLY"
            })
        }
        catch(err){
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        }
    }

    async changeStudentPermisstion(req, res){
        try{
            const userId = res.locals._id;
            const classes =  await Class.findOne({ id_class: Number(req.body.id_class), is_delete: false });
            if(classes.admin == userId){

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
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        }
    }
    //req.body.id_class
    async changeTeacherPermisstion(req, res){
        try{
            const userId = res.locals._id;
            const classes =  await Class.findOne({ id_class: Number(req.body.id_class), is_delete: false });
            if(classes.admin == userId){

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
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        }
    }
}

module.exports = new ClassPermission