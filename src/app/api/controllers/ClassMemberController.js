const mongoose = require('mongoose');
const _ = require("lodash");
const Class = require('../../models/Class');
const ClassMember = require('../../models/ClassMember');
const ClassRole = require('../../models/ClassRole');
const User = require('../../models/User');
const HomeworkAssgin = require('../../models/HomeworkAssign');
const ClassNewsAssign = require('../../models/ClassNewsAssign');
const SubmitHomework = require('../../models/SubmitHomework');
const NotificationController = require('../../api/controllers/NotificationController');
const sendInviteMemberEmail = require('../../mailers/sendEmailActivate/sendEmailInviteMember');
require('dotenv').config();
class ClassMemberController {
    async getMemberClass(req, res) {
        let class_id;
        await Class.findOne({ id_class: Number(req.body.id_class), is_delete: false })
            .then(classs => {
                class_id = classs._id
            });
        ClassMember.find({ class: mongoose.Types.ObjectId(class_id), is_delete: false, $or: [{ status: 0 }, { status: 1 }] })
            .populate('role')
            .populate({
                path: 'user',
                select: ['profile', 'email', 'user_type', 'id_user'],
                populate: {
                    path: 'user_type'
                }
            })
            .exec((err, member) => {
                if (member) {
                    res.json({
                        success: true,
                        message: "get all class successfull!",
                        data: member,
                        res_code: 200,
                        res_status: "GET_SUCCESSFULLY"
                    })
                }
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err,
                        res_code: 500,
                        res_status: "SERVER_ERROR"
                    });
                }
            })
    };
    // req.body: id_class, email, email_invite, class_role
    // status: 0 = admin, 1= actived, 2= pending, 3= giáo viên trong lớp

    async inviteMember(req, res) {
        try {
            // if (req.body.class_role == 2) giáo viên
            // if (req.body.class_role == 1) học sinh
            // list gửi thông báo
            let listReceiver = [];
            const userInvite = await User.findOne({ email: req.body.email_invite })

            //kiểm tra xin lớp có cho mời ko nếu không thông báo nếu có kiểm tra tiếp
            //nếu cho phép
            if(req.class.permission.able_invite_by_student == true){
                // tìm kiếm có tài khoản trong hệ thống không
                // nếu có
                if (userInvite) {
                    let user_Invite_id = userInvite._id;
                    const classMemberInvite = await ClassMember.findOne({
                        user: mongoose.Types.ObjectId(user_Invite_id),
                        class: mongoose.Types.ObjectId(req.class._id),
                        is_delete: false
                    });
    
                    if (classMemberInvite && classMemberInvite.status != 2) {
                        return res.json({
                            success: false,
                            message: "This member is joined class.",
                            res_code: 403,
                            res_status: "NOT_FOUND"
                        })
                    }

                    if(classMemberInvite && classMemberInvite.status == 2){
                        return res.json({
                            success: false,
                            message: "This member is confirming to join in class.",
                            res_code: 403,
                            res_status: "NOT_FOUND"
                        })
                    }
                    console.log('CCCCCCCCCCCCCCCCCCCCCCCC')
                    listReceiver.push(user_Invite_id)
                    const newClassMember = await ClassMember.create({
                        user: mongoose.Types.ObjectId(user_Invite_id),
                        role: mongoose.Types.ObjectId(req.class_role),
                        class: mongoose.Types.ObjectId(req.class._id),
                        status: 2
                    });
                    //await sendInviteMemberEmail(req, userInvite, req.class, newClassMember);
                    res.json({
                        success: true,
                        message: "Invite member successfull!",
                        res_code: 200,
                        res_status: "INVITE_MEMBER_SUCCESSFULLY"
                    });
                    //await NotificationController.inviteClassNotify(req.class._id, res.locals._id, listReceiver, 1);
                    
                }
                // nếu không
                else {
                    return res.json({
                        success: false,
                        message: "Email Not found.",
                        res_code: 403,
                        res_status: "EMAIL_NOT_FOUND"
                    })
                }
            }
            // nếu không
            else{
                return res.json({
                    success: false,
                    message: "This class unenable to invite new member",
                    res_code: 403,
                    res_status: "EMAIL_NOT_FOUND"
                })
            }
        }
        catch (err) {
            console.log(err);
            res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return;
        }
    }
    async accpetInvited(req, res) {
        try {
            let statusRole;
            const classMember = await ClassMember.findOne({ id_class_member: Number(req.query.idClass) })
                .populate('role');

            if (classMember.status == 1 || classMember.status == 3) {
                return res.json({
                    success: false,
                    message: "Email is activated.",
                    res_code: 401,
                    res_status: "EMAIL_IS_ACTIVATED"
                })
            }
            if (classMember.role.id_class_role == 1) {
                statusRole = 1;
            }
            if (classMember.role.id_class_role == 2) {
                statusRole = 1;
            }
            let query = { id_class_member: Number(req.query.idClass) };
            let update =
            {
                status: statusRole
            };
            let option = { new: true };
            await ClassMember.findOneAndUpdate(query, update, option)
            res.redirect(`${process.env.ENDPOINTFE}`)
        }
        catch (err) {
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

    async deleteMember(req, res) {
        try {
            // _id của member bị xóa
            const user = await User.findOne({ email: req.body.email })
            let id_user_deleted = user._id;

            // _id của class member bị xóa
            const classes = await Class.findOne({ id_class: req.body.id_class })
            let id_class = classes._id;

            // quyền của member xóa
            const classMember = await ClassMember.findOne({ class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(res.locals._id), is_delete: false })
            let statusMember = classMember.status;

            let query = { class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(id_user_deleted), is_delete: false };
            let update =
            {
                is_delete: true
            };
            let option = { new: true };

            const memberWantDelete = await ClassMember.findOne({ class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(id_user_deleted), is_delete: false })
                .populate('role')
                .populate({
                    path: 'user',
                    select: ['profile', 'email', 'user_type', 'id_user'],
                    populate: {
                        path: 'user_type'
                    }
                });

            if (memberWantDelete.user.email == res.locals.email) {
                return res.json({
                    success: false,
                    message: "You cant delete yourself!",
                    res_code: 403,
                    res_status: "FAILED"
                })
            }
            if (statusMember == 1 || memberWantDelete.status == 0) {
                return res.json({
                    success: false,
                    message: "No access",
                    res_code: 403,
                    res_status: "NO_ACCESS"
                })
            }
            if (memberWantDelete.role.id_class_role == 1) {
                await ClassMember.findOneAndUpdate(query, update, option);
                res.status(200).json({
                    success: true,
                    message: "Delete member successfull!",
                    res_code: 200,
                    res_status: "DELETE_SUCCESSFULLY"
                })
            }
            else {
                await ClassMember.findOneAndUpdate(query, update, option);
                const arrHomeworkAssgin = await HomeworkAssgin.find({
                    user: mongoose.Types.ObjectId(id_user_deleted),
                    class: mongoose.Types.ObjectId(id_class),
                })
                let b = JSON.parse(JSON.stringify(arrHomeworkAssgin))
                for (let i = 0; i < b.length; b++) {
                    await SubmitHomework.updateMany({
                        assignment: mongoose.Types.ObjectId(b[i]._id)
                    }, { is_delete: true })
                }
                await HomeworkAssgin.updateMany(
                    {
                        user: mongoose.Types.ObjectId(id_user_deleted),
                        class: mongoose.Types.ObjectId(id_class),
                    },
                    {
                        is_delete: true
                    }
                );
                await ClassNewsAssign.updateMany(
                    {
                        user: mongoose.Types.ObjectId(id_user_deleted),
                        class: mongoose.Types.ObjectId(id_class),
                    },
                    {
                        is_delete: true
                    }
                );
                res.status(200).json({
                    success: true,
                    message: "Delete member successfull!",
                    res_code: 200,
                    res_status: "DELETE_SUCCESSFULLY"
                })
            }
        }
        catch (err) {
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        }
    }
    async getMemberProfile(req, res) {
        let userId;
        await User.findOne({ email: req.body.email })
            .then(user => {
                userId = user._id
            });
        let classId;
        await Class.findOne({ id_class: req.body.id_class })
            .then(result => {
                classId = result._id
            });
        let role;
        await ClassMember.findOne({ user: mongoose.Types.ObjectId(userId), class: mongoose.Types.ObjectId(classId) })
            .then(async classMember => {
                role = classMember.status;
                await User.findOne({ _id: mongoose.Types.ObjectId(userId) })
                    .populate('user_type')
                    .then(user => {
                        let userNew = JSON.parse(JSON.stringify(user));
                        delete userNew.password;
                        userNew.role = role;
                        return res.status(200).json({
                            success: true,
                            message: "successfull!",
                            data: userNew,
                            res_code: 200,
                            res_status: "GET_PROFILE_SUCCESSFULLY"
                        })
                    })
                    .catch(err => {
                        return res.json({
                            success: false,
                            message: 'Server error. Please try again.',
                            error: err,
                            res_code: 500,
                            res_status: "SERVER_ERROR"
                        });
                    })
            })
            .catch(err => {
                return res.json({
                    success: false,
                    message: 'Server error. Please try again. get class member fail',
                    error: err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
    };
    async outClass(req, res) {
        try {
            const user = await User.findOne({ email: res.locals.email })
            let userId = user._id;
            const classs = await Class.findOne({ id_class: req.body.id_class })
            let id_class = classs._id;
            let query = { class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(userId), is_delete: false };
            let update =
            {
                is_delete: true
            };
            let option = { new: true };

            const classMember = await ClassMember.findOne({ class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(userId), is_delete: false })
                .populate('role')
                .populate({
                    path: 'user',
                    select: ['profile', 'email', 'user_type', 'id_user'],
                    populate: {
                        path: 'user_type'
                    }
                });
            if (classMember.role.id_class_role == 3) {
                return res.json({
                    success: false,
                    message: "Admin cant out classroom!",
                    res_code: 403,
                    res_status: "FAILED"
                })
            }
            if (classMember.role.id_class_role == 1) {
                await ClassMember.findOneAndUpdate(query, update, option)
                res.status(200).json({
                    success: true,
                    message: "Out classroom successfull!",
                    res_code: 200,
                    res_status: "DELETE_SUCCESSFULLY"
                })
            }
            else {
                const arrHomeworkAssgin = await HomeworkAssgin.find({
                    user: mongoose.Types.ObjectId(userId),
                    class: mongoose.Types.ObjectId(id_class),
                })
                let b = JSON.parse(JSON.stringify(arrHomeworkAssgin))
                for (let i = 0; i < b.length; b++) {
                    await SubmitHomework.updateMany({
                        assignment: mongoose.Types.ObjectId(b[i]._id)
                    }, { is_delete: true })
                }
                await HomeworkAssgin.updateMany(
                    {
                        user: mongoose.Types.ObjectId(userId),
                        class: mongoose.Types.ObjectId(id_class),
                    },
                    {
                        is_delete: true
                    }
                );
                await ClassNewsAssign.updateMany(
                    {
                        user: mongoose.Types.ObjectId(userId),
                        class: mongoose.Types.ObjectId(id_class),
                    },
                    {
                        is_delete: true
                    }
                );
                await ClassMember.findOneAndUpdate(query, update, option)
                res.status(200).json({
                    success: true,
                    message: "Out classroom successfull!",
                    res_code: 200,
                    res_status: "DELETE_SUCCESSFULLY"
                })
            }
        }
        catch (err) {
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        }
    };
    async getStudentInClass(req, res) {
        let classRole
        await ClassRole.findOne({ id_class_role: 2 })
            .then(classRolez => {
                classRole = classRolez._id
            })
        let class_id;
        await Class.findOne({ id_class: Number(req.body.id_class), is_delete: false })
            .then(classs => {
                class_id = classs._id
            });
        ClassMember.find({ class: mongoose.Types.ObjectId(class_id), role: mongoose.Types.ObjectId(classRole), is_delete: false, status: 1 })
            .populate('role')
            .populate({
                path: 'user',
                select: ['profile', 'email', 'user_type', 'id_user'],
                populate: {
                    path: 'user_type'
                }
            })
            .exec((err, member) => {
                if (member) {
                    res.json({
                        success: true,
                        message: "get all class successfull!",
                        data: member,
                        res_code: 200,
                        res_status: "GET_SUCCESSFULLY"
                    })
                }
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err,
                        res_code: 500,
                        res_status: "SERVER_ERROR"
                    });
                }
            })
    }

    async accpetInvitedInNotify(req, res){
        try{
            const classes = await Class.findOne(req.body.id_class);
            const data = _.omit(classes.toJSON(), ['_id', 'createdAt', 'updatedAt', 'admin', 'permission'])
            const memberInvite = await ClassMember.findOne({
                user: res.locals._id,
                class: classes._id,
                status: 2,
                is_delete: false
            })
            if(memberInvite){
                await ClassMember.findOneAndUpdate(
                    {
                        _id: memberInvite._id
                    },
                    {
                        status: 1
                    },
                    {
                        new: true
                    }
                );
                res.json({
                    success: true,
                        message: "Accept invite from classroom successfull!",
                        data: data,
                        res_code: 200,
                        res_status: "ACCEPT_INVITE_MEMBER_SUCCESSFULLY"
                })
            }
            else{
                res.json({
                    success: false,
                    message: "NOT FOUND",
                    res_code: 403,
                    res_status: "NOT FOUND"
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
};

module.exports = new ClassMemberController;