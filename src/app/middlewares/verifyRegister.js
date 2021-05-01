const emailValidate = require("email-validator");
const passwordValidator = require('password-validator');
const yup = require('yup');

const User = require('../models/User');


checkDuplicateEmail = (req, res, next) =>{
    User.findOne({
        email : req.body.email
    })
    .exec((error, user) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: error 
            });
            return;
        }
        if (user) {
            res.status(403).json({
                success: false,
                message: "Failed! email is already in use!" 
            });
            return;
        }
        next();
    })
};

checkValidateEmail = (req, res, next) => {
    let emailSchema = yup.object().shape({
        email: yup.string().required().email()
    });
    emailSchema.isValid({ email: req.body.email})
        .then(valid =>{
            if(valid) next();
            else{
                res.status(403).send({
                    success: false,
                    message: "Email invalid" 
                });
                return;
            }
        })
        .catch(error =>{
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Server is error",
                error: error
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
                res.status(403).json({
                    success: false,
                    message: "Password length min is 6 and max is 15" 
                });
                return;
            }
        })
        .catch(error =>{
            console.log(error)
            res.status(500).json({
                success: false,
                message: "Server is error",
                error: error
            });
            return;
        })
}


module.exports = { checkDuplicateEmail, checkValidateEmail, checkValidatePassword }