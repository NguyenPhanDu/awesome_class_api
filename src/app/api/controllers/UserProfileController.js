const mongoose = require('mongoose');
const User = require('../../models/User');

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
                    error: error.err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            })
    };

    updateUserProfile(req, res){
        let query = {email: req.body.email};
        let update = 
            {
                profile: {
                    name: {
                        first_name: req.body.first_name,
                        last_name: req.body.last_name
                    },
                    avatar: req.body.avatar,
                    phone: req.body.phone,
                    address: req.body.address,
                    about: req.body.about
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
                    error: error.err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                });
            }
        })
    }
}

module.exports = new UserProfile;