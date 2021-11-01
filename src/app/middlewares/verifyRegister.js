const emailValidate = require("email-validator");
const passwordValidator = require('password-validator');
const yup = require('yup');

const User = require('../models/User');

async function checkDuplicateEmail(req, res, next){
    try{
        const user = await User.findOne({ email : req.body.email });
        if (user) {
            return res.json({
                success: false,
                message: "Failed! email is already in use!",
                res_code: 403,
                res_status: "DUPLICATE_EMAIL"
            });
        }
        next();
    }
    catch(err){
        console.log(err)
        res.json({
            success: false,
            message: error,
            res_code: 500,
            res_status: "SERVER_ERROR"
        })
    }
};

checkValidateEmail = (req, res, next) => {
    let emailSchema = yup.object().shape({
        email: yup.string().required().email()
    });
    emailSchema.isValid({ email: req.body.email})
        .then(valid =>{
            if(valid) next();
            else{
                res.json({
                    success: false,
                    message: "Email invalid",
                    res_code: 403,
                    res_status: "EMAIL_INVALID"
                });
                return;
            }
        })
        .catch(error =>{
            console.log(error)
            res.json({
                success: false,
                message: "Server is error",
                error: error,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return;
        })
}  

checkValidatePassword = (req, res, next) =>{
    let passwordSchema = yup.object().shape({
        password: yup.string().required().max(15).min(6)
    })
    passwordSchema.isValid({ password: req.body.password })
        .then(valid =>{
            if(valid) next();
            else{
                res.json({
                    success: false,
                    message: "Password length min is 6 and max is 15",
                    res_code: 403,
                    res_status: "PASSWORD_INVALID"
                });
                return;
            }
        })
        .catch(error =>{
            console.log(error)
            res.json({
                success: false,
                message: "Server is error",
                error: error,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return;
        })
}


module.exports = { checkDuplicateEmail}