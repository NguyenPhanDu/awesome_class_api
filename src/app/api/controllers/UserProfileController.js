const mongoose = require('mongoose');
const User = require('../../models/User');
const imgur = require('../../imgur/service');

class UserProfile{
    getUserProfile(req, res){
        User.findOne({ email: req.body.email })
            .then(user => {
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
    };

    async updateUserProfile(req, res){
        let user;
        await User.findOne({email: req.body.email})
            .then(result => {
                user = result
            })
        let query = {email: req.body.email};
        let update = 
            {
                profile: {
                    avatar: user.profile.avatar,
                    name: {
                        first_name: req.body.first_name,
                        last_name: req.body.last_name
                    },
                    phone: req.body.phone,
                    address: req.body.address,
                    dob: req.body.dob
                }
            };
        let option = {new: true}
        User.findOneAndUpdate(query,update,option,function(err, user){
            if(user){
                let userNew = JSON.parse(JSON.stringify(user));
                delete userNew.password;
                return res.status(200).json({
                    success: true,
                    message: "Update profile successfull!",
                    data: userNew,
                    res_code: 200,
                    res_status: "UPDATE_PROFILE_SUCCESSFULLY"
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

    async updateAvatar(req, res){
        await User.findOne({email: req.body.email})
            .then(async user => {
                if(!user){
                    return res.json({
                        success: false,
                        message: "Email Not found.",
                        res_code: 403,
                        res_status: "EMAIL_NOT_FOUND"
                    })
                }
                let avatar;
                await imgur
                    .uploadBase64(req.body.avatar,"b4L0vU3")
                    .then((json) => {
                        avatar = json.link
                    })
                    .catch((err) => {
                        console.error(err.message);
                        return;
                    });
                let query = {email: user.email};
                let update = 
                {
                    profile: {
                        avatar: avatar,
                        name: {
                            first_name: user.profile.name.first_name,
                            last_name: user.profile.name.last_name
                        },
                        phone: user.profile.phone,
                        address: user.profile.address,
                        dob: user.profile.dob
                    }
                };
                let option = {new: true};
                await User.findOneAndUpdate(query, update, option)
                    .then(user => {
                        return res.status(200).json({
                            success: true,
                            message: "Update avatar successfull!",
                            data: user,
                            res_code: 200,
                            res_status: "UPDATE_SUCCESSFULLY"
                        })
                    })
                    .catch(error => {
                        return res.json({
                            success: false,
                            message: 'Server error. Please try again.',
                            error: error,
                            res_code: 500,
                            res_status: "SERVER_ERROR"
                        });
                    })
            })
            .catch(error => {
                return res.json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: error.err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
    };
    
}

module.exports = new UserProfile;