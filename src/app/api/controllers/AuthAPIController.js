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
        let user_type_id;
        await UserType.findOne({ id_user_type: 2 })
        .then(result=>{
            user_type_id = result._id;
        })
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            user_type:  mongoose.Types.ObjectId(user_type_id),
            activated_code: generateRandomCode(8)
        });
        await user.save()
            .then(async user => {
                let user2;
                await User.findOne({_id : user._id}).populate('user_type')
                    .then( newUser =>{
                        user2 = newUser
                    })
                await res.json({
                    success: true,
                    message: "Sign up successfull!",
                    data: user2,
                    res_code: 200,
                    res_status: "REGISTER_SUCCESSFULLY"
                })
                sendActiveMail(req,user2);
                
            })
            .catch(error =>{
                console.log(error);
                res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: error.message,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
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
                        message: "Wrong email",
                        res_code: 403,
                        res_status: "WRONG_PASSWORD"
                    })
                }
                let token = jwt.sign({_id: user._id}, secretKeyJwt.secret,{expiresIn: 86400})
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
    }
    
};

module.exports = new UserController;