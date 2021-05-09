const mongoose = require('mongoose');
const User = require('../../models/User');
const UserType = require('../../models/UserType');
const secretKeyJwt = require('../../../config/auth')
const jwt = require('jsonwebtoken');
const sendActiveMail = require('../../mailers/sendEmailActivate/sendEmailActivate');
const generateRandomCode = require('../../../helpers/index');
const imgur = require('../../imgur/service');
class SocialLogin{
    async loginWithFacebook(req, res){
        let user_type_id;
        await UserType.findOne({ id_user_type: 2 })
            .then(result=>{
                user_type_id = result._id;
            })
        await User.findOne({ email: req.body.email})
            .then(async result => {
                if(!result){
                    let avatar;
                    await imgur
                    .uploadUrl(req.body.avatar,"b4L0vU3")
                    .then((json) => {
                      avatar = json.link
                    })
                    .catch((err) => {
                        console.error(err.message);
                    });
                    console.log({avatar})
                    const user = new User({
                        email: req.body.email,
                        user_type:  mongoose.Types.ObjectId(user_type_id),
                        profile: {
                            name: {
                                first_name: req.body.first_name,
                                last_name: req.body.last_name
                            },
                            avatar: avatar
                        },
                        social: 'Facebook',
                        activated_code: generateRandomCode(8)
                    });
                    await user.save()
                        .then(async user => {
                            sendActiveMail(req,user);
                            let token = jwt.sign({_id: user._id}, secretKeyJwt.secret,{expiresIn: 86400})
                            let userNew = JSON.parse(JSON.stringify(user));
                            userNew.access_token = token;
                            res.status(200).json({
                                success: true,
                                message: "Login with facebook account successfull!",
                                data: userNew,
                                res_code: 200,
                                res_status: "LOGIN_SUCCESSFULLY"
                            }); 
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
                else{
                    let token = jwt.sign({_id: result._id}, secretKeyJwt.secret,{expiresIn: 86400})
                    let userNew = JSON.parse(JSON.stringify(result));
                    userNew.access_token = token;
                    res.status(200).json({
                        success: true,
                        message: "Login with facebook account successfull!",
                        data: userNew,
                        res_code: 200,
                        res_status: "LOGIN_SUCCESSFULLY"
                    }); 
                }
            })
    }

    async loginWithGoogle(req, res){
        let user_type_id;
        await UserType.findOne({ id_user_type: 2 })
            .then(result=>{
                user_type_id = result._id;
            })
        await User.findOne({ email: req.body.email})
            .then(async result => {
                if(!result){
                    let avatar;
                    await imgur
                    .uploadUrl(req.body.avatar,"b4L0vU3")
                    .then((json) => {
                      avatar = json.link
                    })
                    .catch((err) => {
                        console.error(err.message);
                    });
                    const user = new User({
                        email: req.body.email,
                        user_type:  mongoose.Types.ObjectId(user_type_id),
                        profile: {
                            name: {
                                first_name: req.body.first_name,
                                last_name: req.body.last_name
                            },
                            avatar: avatar
                        },
                        social: 'Google',
                        activated_code: generateRandomCode(8)
                    });
                    await user.save()
                        .then(async user => {
                            sendActiveMail(req,user);
                            let token = jwt.sign({_id: user._id}, secretKeyJwt.secret,{expiresIn: 86400})
                            let userNew = JSON.parse(JSON.stringify(user));
                            userNew.access_token = token;
                            res.status(200).json({
                                success: true,
                                message: "Login with google account successfull!",
                                data: userNew,
                                res_code: 200,
                                res_status: "LOGIN_SUCCESSFULLY"
                            }); 
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
                else{
                    let token = jwt.sign({_id: result._id}, secretKeyJwt.secret,{expiresIn: 86400})
                    let userNew = JSON.parse(JSON.stringify(result));
                    userNew.access_token = token;
                    res.status(200).json({
                        success: true,
                        message: "Login with facebook account successfull!",
                        data: userNew,
                        res_code: 200,
                        res_status: "LOGIN_SUCCESSFULLY"
                    }); 
                }
            })
    }
}

module.exports = new SocialLogin;