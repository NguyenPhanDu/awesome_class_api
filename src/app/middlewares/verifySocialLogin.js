const yup = require('yup');
const User = require('../models/User');

checkDuplicateEmailFacebook = (req, res, next) =>{
    User.findOne({
        email : req.body.email
    })
    .exec((error, user) => {
        if (error) {
            res.json({
                success: false,
                message: error ,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return;
        }
        if (user) {
            if(user.social != 'Facebook'){
                res.json({
                    success: false,
                    message: "Failed! email is already in use!",
                    res_code: 403,
                    res_status: "DUPLICATE_EMAIL"
                });
                return;
            }
        }
        next();
    })
};

checkDuplicateEmailGoogle = (req, res, next) =>{
    User.findOne({
        email : req.body.email
    })
    .exec((error, user) => {
        if (error) {
            res.json({
                success: false,
                message: error ,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return;
        }
        if (user) {
            if(user.social != 'Google'){
                res.json({
                    success: false,
                    message: "Failed! email is already in use!",
                    res_code: 403,
                    res_status: "DUPLICATE_EMAIL"
                });
                return;
            }
        }
        next();
    })
};



module.exports = { checkDuplicateEmailFacebook, checkDuplicateEmailGoogle }