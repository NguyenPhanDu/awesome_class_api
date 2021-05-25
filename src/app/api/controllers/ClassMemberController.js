const mongoose = require('mongoose');
const Class = require('../../models/Class');
const ClassMember = require('../../models/ClassMember');
const ClassRole = require('../../models/ClassRole');
const User = require('../../models/User');
const sendInviteMemberEmail = require('../../mailers/sendEmailActivate/sendEmailInviteMember');

class ClassMemberController{
    async getMemberClass(req, res){
        let class_id;
        await Class.findOne({ id_class: Number(req.body.id_class), is_deltete: false })
            .then(classs => {
                class_id = classs._id
            });
        ClassMember.find({ class: mongoose.Types.ObjectId(class_id), is_deltete: false })
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
    // status: 0 = admin, 1= actived, 2= pending, 3= disable
    async inviteMember(req, res){
        let class_role;
        if(req.body.role == 1){
            await ClassRole.findOne({id_class_role: 1})
            .then(classRole => {
                class_role = classRole._id
            })
        }
        if(req.body.role == 2){
            await ClassRole.findOne({id_class_role: 2})
            .then(classRole => {
                class_role = classRole._id
            })
        }
        let classObj;
        await Class.findOne({id_class: req.body.id_class})
            .then(classs => {
                classObj = classs;
            })
        let user_id;
        let useraa;
        await User.findOne({ email: req.body.email_invite })
            .then(user => {
                if(!user){
                    return res.json({
                        success: false,
                        message: "Email Not found.",
                        res_code: 403,
                        res_status: "EMAIL_NOT_FOUND"
                    })
                }
                user_id = user._id;
                useraa= user;
            })
        await ClassMember.findOne({ 
            user: mongoose.Types.ObjectId(user_id),
            class: mongoose.Types.ObjectId(classObj._id)
        })
            .then(classMember =>{
                if(!classMember){
                    const newClassMember = new ClassMember({
                        user: mongoose.Types.ObjectId(user_id),
                        role: mongoose.Types.ObjectId(class_role),
                        class: mongoose.Types.ObjectId(classObj._id),
                        status: 2
                    })
                    newClassMember.save()
                        .then(result => {
                            res.json({
                                success: true,
                                message: "Invite member successfull!",
                                res_code: 200,
                                res_status: "INVITE_MEMBER_SUCCESSFULLY"
                            })
                            sendInviteMemberEmail(req,useraa,classObj,result);
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
                }
                if(classMember){
                    return res.json({
                        success: false,
                        message: "This member is joined class.",
                        res_code: 403,
                        res_status: "NOT_FOUND"
                    })
                } 
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
    };
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
                    statusRole = 3;
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
        // _id của member bị xóa
        let id_user_deleted;
        await User.findOne({email : req.body.email})
            .then(user => {
                id_user_deleted = user._id
            });
        
        // _id của class member bị xóa
        let id_class;
        await Class.findOne({id_class: req.body.id_class})
            .then(classs => {
                id_class = classs._id;
            });

        // quyền của member xóa
        let statusMember;
        await ClassMember.findOne({class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(res.locals._id)})
            .then(classMember => {
                statusMember = classMember.status;
            })

        let query = {class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(id_user_deleted), is_deltete: false};
        let update = 
            {
                is_deltete: true
            };
        let option = {new: true};

        await ClassMember.findOne({ class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(id_user_deleted), is_deltete: false })
            .populate('role')
            .populate({
                path:'user',
                select:['profile','email', 'user_type', 'id_user'], 
                populate: {
                    path: 'user_type'
                }
            })
            .then(async classMember => {
                if(classMember.user.email == res.locals.email){
                    return res.json({
                        success: false,
                        message: "You cant delete yourself!",
                        res_code: 403,
                        res_status: "FAILED"
                    }) 
                }
                if(statusMember == 1 || classMember.status == 0){
                    return res.json({
                        success: false,
                        message: "No access",
                        res_code: 403,
                        res_status: "NO_ACCESS"
                    })
                }
                await ClassMember.findOneAndUpdate(query, update, option)
                    .then(classMember => {
                        return res.status(200).json({
                            success: true,
                            message: "Delete member successfull!",
                            res_code: 200,
                            res_status: "DELETE_SUCCESSFULLY"
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
            .catch(err=>{
                return res.json({
                    success: false,
                    message: 'Server error. Please try again. update failed',
                    error: err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
    };
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
        let query = {class: mongoose.Types.ObjectId(id_class), user: mongoose.Types.ObjectId(userId), is_deltete: false};
        let update = 
            {
                is_deltete: true
            };
        let option = {new: true};
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
    }
};

module.exports = new ClassMemberController;