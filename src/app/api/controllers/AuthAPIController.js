const mongoose = require('mongoose');
const User = require('../../models/User');
const UserType = require('../../models/UserType');
const bcrypt = require('bcrypt');
const secretKeyJwt = require('../../../config/auth')
const jwt = require('jsonwebtoken');
const sendActiveMail = require('../../mailers/sendEmailActivate/sendEmailActivate')
const generateRandomCode = require('../../../helpers/index')
class UserController{
    async signUp(req, res){
        try{
            const userType = await UserType.findOne({ id_user_type: 2 });
            const user_type_id = userType._id
            const user = await User.create({
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 8),
                user_type:  mongoose.Types.ObjectId(user_type_id),
                activated_code: generateRandomCode(8)
            });
            const data = await User.findOne({_id : user._id}).populate('user_type')
            await sendActiveMail(req,data);
            res.json({
                success: true,
                message: "Sign up successfull!",
                data: data,
                res_code: 200,
                res_status: "REGISTER_SUCCESSFULLY"
            })
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
        }
    }

    signIn(req, res){
        User.findOne({email : req.body.email})
            .populate('user_type')
            .then(user => {
                if(!user){
                    return res.json({
                        success: false,
                        message: "Email Not found.",
                        res_code: 403,
                        res_status: "EMAIL_NOT_FOUND"
                    })
                }
                let passwordIsValid = bcrypt.compareSync(req.body.password,user.password)
                if(!passwordIsValid){
                    return res.json({
                        success: false,
                        message: "Wrong password",
                        res_code: 403,
                        res_status: "WRONG_PASSWORD"
                    })
                }
                let token = jwt.sign({_id: user._id, email: user.email}, secretKeyJwt.secret,{expiresIn: 86400})
                let userNew = JSON.parse(JSON.stringify(user));
                userNew.access_token = token;
                res.status(200).json({
                    success: true,
                    message: "Login successfull!",
                    data: userNew,
                });
            })
            .catch(error =>{
                res.json({
                    success: false,
                    message: error,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                })
            })
    };

    getUser(req, res){
        User.findOne({id_user: req.params.id})
            .then(user =>{
                if(!user){
                    return res.json({
                        success: true,
                        message: "Cant't find this user",
                        res_code: 403,
                        res_status: "GET_PROFILE_FAILED"
                    })
                }
                let userNew = JSON.parse(JSON.stringify(user));
                delete userNew.password;
                res.json({
                    success: true,
                    message: "get user successfull!",
                    data: userNew,
                    res_code: 200,
                    res_status: "GET_USER_SUCCESSFULLY"
                })
            })
            .catch(err => {
                return res.json({
                    success: false,
                    message: error,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                })
            })
    }
    
};

module.exports = new UserController;