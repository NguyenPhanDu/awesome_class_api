const mongoose = require('mongoose');
const User = require('../../models/User');
const UserType = require('../../models/UserType');
const bcrypt = require('bcrypt');
const secretKeyJwt = require('../../../config/auth')
const jwt = require('jsonwebtoken');


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
            user_type:  mongoose.Types.ObjectId(user_type_id)
        });
        await user.save()
            .then(async user => {
                let user2;
                await User.findOne({_id : user._id}).populate('user_type')
                    .then( newUser =>{
                        user2 = newUser
                    })
                await res.status(200).json({
                    success: true,
                    message: "Sign up successfull!",
                    data: user2
                })
            })
            .catch(error =>{
                console.log(error);
                res.status(500).json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: error.message,
                });
            })
    }

    signIn(req, res){
        User.findOne({email : req.body.email})
            .populate('user_type')
            .then(user => {
                if(!user){
                    return res.status(404).json({
                        success: false,
                        message: "User Not found."
                    })
                }
                let passwordIsValid = bcrypt.compareSync(req.body.password,user.password)
                if(!passwordIsValid){
                    return res.status(403).json({
                        success: false,
                        message: "Wrong email"
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
                console.log(error)
                res.status(500).json({
                    success: false,
                    message: error
                })
            })
    }
};

module.exports = new UserController;