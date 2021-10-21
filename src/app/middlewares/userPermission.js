const UserType = require('../models/UserType');
const User = require('../models/User')
const Class = require('../models/Class');
const ClassRole = require('../models/ClassRole');
const ClassMember = require('../models/ClassMember');
async function limitClassCreation(req, res, next){
    try{
        const user = await User.findOne({ email : res.locals.email })
        .populate({
            path: 'user_type'
        });
        const amountClass = await Class.countDocuments({ admin:  user._id, is_delete: false});
        // đếm số lớp nó tạo nếu 
        if(user.user_type.id_user_type == 2){
            if(amountClass > 20){
                return res.json({
                    success: false,
                    message: "Limit 20 classes creation in your account!",
                    res_status: "LIMIT_CLASS_NORMAL"
                });
            }
            else{
                next();
            }
        }
        else if(user.user_type.id_user_type == 3){
            if(amountClass > 100){
                return res.json({
                    success: false,
                    message: "Limit 100 classes creation in your account!",
                    res_status: "LIMIT_CLASS_NORMAL"
                });
            }
            else{
                next();
            }
        }
        else{
            next();
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
    }
}

async function limitMemberInClass(req, res, next){
    try{
        const a = await Class.findOne({ id_class: req.body.id_class })
        if(a){
            req.class = a;
            next();
        }
        else{
            return res.json({
                success: false,
                message: "cccc!",
                res_status: "LIMIT_CLASS_NORMAL"
            });
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
    }
}

async function limitMemberInClassWhileJoinClass(req, res, next){
    try{
        const studentRole = await ClassRole.findOne({id_class_role: 2});
        const classWantJoin = await Class.findOne({ class_code: req.body.class_code })
        .populate([
            {
                path: 'permission'
            },
            {
                path: 'admin',
                populate: {
                    path: 'user_type'
                }
            }
        ])
        if(classWantJoin){
            if(classWantJoin.permission.joinable_by_code == true){
                const amountStudent = await ClassMember.countDocuments({class: classWantJoin._id, is_delete: false , role: studentRole._id});
                console.log('so luong'+amountStudent)
                if(classWantJoin.admin.user_type.id_user_type == 2){
                    if(amountStudent >= 1){
                        return res.json({
                            success: false,
                            message: "Student in class is full",
                            res_status: "LIMIT_CLASS_NORMAL"
                        });
                    }
                    else{
                        req.studentRole = studentRole;
                        req.class = classWantJoin;
                        return next();
                    }
                }
                else{
                    if(amountStudent >= 150){
                        return res.json({
                            success: false,
                            message: "Student in class is full",
                            res_status: "LIMIT_CLASS_NORMAL"
                        });
                    }
                    else{
                        req.studentRole = studentRole;
                        req.class = classWantJoin;
                        return next();
                    }
                }
            }
            else{
                res.json({
                    success: false,
                    message: "This class unenable to join",
                    res_code: 403,
                    res_status: "UNENABLE_TO_JOIN"
                })
            }
        }
        else{
            res.json({
                success: false,
                message: "Class not foundsss",
                res_code: 403,
                res_status: "NOT_FOUND"
            })
        }
    }
    catch(err){
        console.log(err)
        return res.json({
            success: false,
            message: 'Server error. Please try again.',
            error: err,
            res_code: 500,
            res_status: "SERVER_ERROR"
        });
    }
    
}

module.exports = {
    limitClassCreation,
    limitMemberInClass,
    limitMemberInClassWhileJoinClass
}