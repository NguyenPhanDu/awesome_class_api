const mongoose = require('mongoose');
const Class = require('../../models/Class');
const ClassMember = require('../../models/ClassMember');
const ClassRole = require('../../models/ClassRole');
const User = require('../../models/User');
const sendInviteMemberEmail = require('../../mailers/sendEmailActivate/sendEmailInviteMember');

class ClassMemberController{
    async getMemberClass(req, res){
        let class_id;
        await Class.findOne({ id_class: Number(req.body.id_class) })
            .then(classs => {
                class_id = classs._id
            });
        ClassMember.find({ class: mongoose.Types.ObjectId(class_id) })
            .populate('role')
            .populate({path:'user',select:['profile','email']})
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
    }
    async accpetInvited(req, res){
        await ClassMember.findOne({id_class_member: Number(req.query.idClass)})
            .then(classMember => {
                if(classMember.status == 1){
                    return res.json({
                        success: false,
                        message: "Email is activated.",
                        res_code: 401,
                        res_status: "EMAIL_IS_ACTIVATED"
                    })
                }
            })
        let query = {id_class_member: Number(req.query.idClass)};
        let update = 
            {
                status: 1
            };
        let option = {new: true};
        await ClassMember.findOneAndUpdate(query, update, option)
        .then(result =>{
            res.redirect('http://localhost:3000')
        })
    }
};

module.exports = new ClassMemberController;