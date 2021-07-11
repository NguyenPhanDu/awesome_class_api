const mongoose = require('mongoose');
const Class = require('../../models/Class');
const ClassMember = require('../../models/ClassMember');
const ClassRole = require('../../models/ClassRole');
const User = require('../../models/User');
const HomeworkAssgin = require('../../models/HomeworkAssign');
const ClassNewsAssign = require('../../models/ClassNewsAssign');
const sendInviteMemberEmail = require('../../mailers/sendEmailActivate/sendEmailInviteMember');

class ClassMemberController{
    async getMemberClass(req, res){
        let class_id;
        await Class.findOne({ id_class: Number(req.body.id_class), is_delete: false })
            .then(classs => {
                class_id = classs._id
            });
        ClassMember.find({ class: mongoose.Types.ObjectId(class_id), is_delete: false })
            .populate('role')
            .populate({
                path:'user',
                select:['profile','email', 'user_type', 'id_user'], 
                populate: {
                    path: 'user_type'
                }
            })
            .exec((err, member)=>{
                if(member){
                    res.json({
                        success: true,
                        message: "get all class successfull!",
                        data: member,
                        res_code: 200,
                        res_status: "GET_SUCCESSFULLY"
                    })
                }
                if(err){
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

    async inviteMember(req, res){
        try{
            // teacher: 609b8123f7510b2328795fd4
            // student: 609b812bf7510b2328795fd5
            let class_role;
            if(req.body.class_role == 1){
                let classRole  = await ClassRole.findOne({id_class_role: 2})

                class_role = classRole._id
            }
            if(req.body.class_role == 2){
                let classRole = await ClassRole.findOne({id_class_role: 1})
                class_role = classRole._id
            }
            const classObj = await Class.findOne({id_class: req.body.id_class})
            const userInvite = await User.findOne({ email: req.body.email_invite })
            // tìm tài khoản mời trong database
            // nếu có
            if(userInvite){
                let user_Invite_id = userInvite._id;
                const classMemberInvite = await ClassMember.findOne({ 
                    user: mongoose.Types.ObjectId(user_Invite_id),
                    class: mongoose.Types.ObjectId(classObj._id),
                });
                //tìm kiếm xem tài khoản đã từng là thành viên của lớp hay chưa
                //nếu có rồi mà trong db đã xóa thì cập nhật lại
                if(classMemberInvite && classMemberInvite.is_delete == true){
                    const classMemberInviteUpdate = await ClassMember.findOneAndUpdate(
                        {
                            _id: mongoose.Types.ObjectId(classMemberInvite._id)
                        },
                        {
                            status: 2,
                            is_delete: false,
                            role: mongoose.Types.ObjectId(class_role)
                        },
                        {
                            new: true
                        }
                    );
                    res.json({
                        success: true,
                        message: "Invite member successfull!",
                        res_code: 200,
                        res_status: "INVITE_MEMBER_SUCCESSFULLY"
                    });
                    await sendInviteMemberEmail(req,userInvite,classObj,classMemberInviteUpdate);
                }
                // nếu không xóa thì thông báo đã join rồi
                else if(classMemberInvite && classMemberInvite.is_delete == false){
                    return res.json({
                        success: false,
                        message: "This member is joined class.",
                        res_code: 403,
                        res_status: "NOT_FOUND"
                    })
                }
                // chưa có trong data thì tạo mới
                else{
                    const newClassMember = await ClassMember.create({
                        user: mongoose.Types.ObjectId(user_Invite_id),
                        role: mongoose.Types.ObjectId(class_role),
                        class: mongoose.Types.ObjectId(classObj._id),
                        status: 2
                    });
                    res.json({
                        success: true,
                        message: "Invite member successfull!",
                        res_code: 200,
                        res_status: "INVITE_MEMBER_SUCCESSFULLY"
                    });
                    await sendInviteMemberEmail(req,userInvite,classObj,newClassMember);
                }
            }
            // nếu không thông báo không tìm thấy
            else{
                return res.json({
                    success: false,
                    message: "Email Not found.",
                    res_code: 403,
                    res_status: "EMAIL_NOT_FOUND"
                })
            }
        }
        catch(err){
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
    async accpetInvited(req, res){
        let statusRole;
        await ClassMember.findOne({id_class_member: Number(req.query.idClass)})
            .populate('role')
            .then(classMember => {
                if(classMember.status == 1 || classMember.status == 3){
                    return res.json({
                        success: false,
                        message: "Email is activated.",
                        res_code: 401,
                        res_status: "EMAIL_IS_ACTIVATED"
                    })
                }
                if(classMember.role.id_class_role == 1){
                    statusRole = 1;
                }
                if(classMember.role.id_class_role == 2){
                    statusRole = 1;
                }
            })
        let query = {id_class_member: Number(req.query.idClass)};
        let update = 
            {
                status: statusRole
            };
        let option = {new: true};
        await ClassMember.findOneAndUpdate(query, update, option)
        .then(result =>{
            res.redirect('http://localhost:3000')
        })
    };

    async deleteMember(req, res){
        try{
            // _id của member bị xóa
            const user = await User.findOne({email : req.body.email})
            let id_user_deleted = user._id;
            
            // _id của class member bị xóa
            const classes = await Class.findOne({id_class: req.body.id_class})
            let id_class = classes._id;

            // quyền của member xóa
            const classMember =  await ClassMember.findOne({class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(res.locals._id)})
            let statusMember = classMember.status;

            let query = {class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(id_user_deleted), is_delete: false};
            let update = 
                {
                    is_delete: true
                };
            let option = {new: true};

            const memberWantDelete = await ClassMember.findOne({ class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(id_user_deleted), is_delete: false })
            .populate('role')
            .populate({
                path:'user',
                select:['profile','email', 'user_type', 'id_user'], 
                populate: {
                    path: 'user_type'
                }
            });

            if(memberWantDelete.user.email == res.locals.email){
                return res.json({
                    success: false,
                    message: "You cant delete yourself!",
                    res_code: 403,
                    res_status: "FAILED"
                }) 
            }
            if(statusMember == 1 || memberWantDelete.status == 0){
                return res.json({
                    success: false,
                    message: "No access",
                    res_code: 403,
                    res_status: "NO_ACCESS"
                })
            }
            await ClassMember.findOneAndUpdate(query, update, option);
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
    async getMemberProfile(req, res){
        let userId;
        await User.findOne({email : req.body.email})
            .then(user => {
                userId = user._id
            });
        let classId;
        await Class.findOne({id_class: req.body.id_class})
            .then(result =>{
                classId = result._id
            });
        let role;
        await ClassMember.findOne({ user : mongoose.Types.ObjectId(userId), class : mongoose.Types.ObjectId(classId) })
            .then(async classMember => {
                role = classMember.status;
                await User.findOne({_id : mongoose.Types.ObjectId(userId)})
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
    async outClass(req, res){
        let userId;
        await User.findOne({email: res.locals.email})
            .then(user => {
                userId = user._id;
            });
        let id_class;
        await Class.findOne({id_class: req.body.id_class})
            .then(classs => {
                id_class = classs._id;
            });
        let query = {class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(userId), is_delete: false};
        let update = 
            {
                is_delete: true
            };
        let option = {new: true};

        await ClassMember.findOne({ class : mongoose.Types.ObjectId(id_class), user : mongoose.Types.ObjectId(userId), is_delete : false})
            .populate('role')
            .populate({
                path:'user',
                select:['profile','email', 'user_type', 'id_user'], 
                populate: {
                    path: 'user_type'
                }
            })
            .then(async classMember => {
                if(classMember.status == 0){
                    return res.json({
                        success: false,
                        message: "Admin cant out classroom!",
                        res_code: 403,
                        res_status: "FAILED"
                    })
                }
                await ClassMember.findOneAndUpdate(query, update, option)
                    .then(classMember => {
                        return res.status(200).json({
                            success: true,
                            message: "Out classroom successfull!",
                            res_code: 200,
                            res_status: "OUT_SUCCESSFULLY"
                        })
                    })
                    .catch(err=>{
                            return res.json({
                                success: false,
                                message: 'Server error. Please try again.',
                                error: err,
                                res_code: 500,
                                res_status: "SERVER_ERROR"
                            });
                        });
            })
    };
    async getStudentInClass(req, res){
        let classRole
        await ClassRole.findOne({id_class_role: 2})
            .then(classRolez => {
                classRole = classRolez._id
            })
        let class_id;
        await Class.findOne({ id_class: Number(req.body.id_class), is_delete: false })
            .then(classs => {
                class_id = classs._id
            });
        ClassMember.find({ class: mongoose.Types.ObjectId(class_id),role: mongoose.Types.ObjectId(classRole) ,is_delete: false })
            .populate('role')
            .populate({
                path:'user',
                select:['profile','email', 'user_type', 'id_user'], 
                populate: {
                    path: 'user_type'
                }
            })
            .exec((err, member)=>{
                if(member){
                    res.json({
                        success: true,
                        message: "get all class successfull!",
                        data: member,
                        res_code: 200,
                        res_status: "GET_SUCCESSFULLY"
                    })
                }
                if(err){
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
};

module.exports = new ClassMemberController;