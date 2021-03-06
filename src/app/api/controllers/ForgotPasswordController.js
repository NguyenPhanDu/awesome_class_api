const bcrypt = require('bcrypt');
const User = require('../../models/User');
const UserReset = require('../../models/UserResetPassword');
const generateRandomCode = require('../../../helpers/index');
const sendResetPasswordMail = require('../../mailers/sendEmailActivate/sendEmailResetPass');

class forgotPassword{
    // async sendReSetMails(req, res){
    //     let userId;
    //     await User.findOne({email: req.body.email})
    //         .then(user => {
    //             if(!user){
    //                 return res.json({
    //                     success: false,
    //                     message: "Email Not found.",
    //                     res_code: 403,
    //                     res_status: "EMAIL_NOT_FOUND"
    //                 });
    //             }
    //             userId = user.id_user;
    //         })

    //     await UserReset.findOne({id_user: userId})
    //         .then(user => {
    //             if(user){
    //                 UserReset.deleteOne({id_user : user.id_user})
    //                 .then(res => {
    //                 })
    //                 .catch(err =>{
    //                 })
    //             }  
    //         })
    //     const userReset = new UserReset({
    //         reset_code: generateRandomCode(8),
    //         id_user: userId,
    //         email: req.body.email
    //     })
    //     await userReset.save()
    //         .then(user =>{
    //             res.json({
    //                 success: true,
    //                 message: " successfull!",
    //                 data: user,
    //                 res_code: 200,
    //                 res_status: "RESET_EMAIL_SUCCESSFULLY"
    //             });
    //             sendResetPasswordMail(req,user)
    //         })
    //         .catch(err =>{
    //             res.json({
    //                 success: false,
    //                 message: 'Server error. Please try again.',
    //                 error: err.message,
    //                 res_code: 500,
    //                 res_status: "SERVER_ERROR"
    //             });
    //         })
    // }

    async sendReSetMail(req, res){
        try{
            const user = await User.findOne({ email: req.body.email });
            // t??m ki???m trong b???ng user reset
            const userRest = await UserReset.findOne({id_user:  user.id_user});
            if(userRest){
                await UserReset.deleteOne({ id_user:  user.id_user });
            }
            const code = await generateRandomCode(8)
            const newUserResetPassword = await UserReset.create(
                {
                    reset_code: code,
                    id_user: user.id_user,
                    email: req.body.email
                }
            );
            res.json({
                success: true,
                message: " successfull!",
                data: user,
                res_code: 200,
                res_status: "RESET_EMAIL_SUCCESSFULLY"
            });
            sendResetPasswordMail(req,newUserResetPassword)
        }
        catch(err){
            return res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
        }
    }

    async handleForgotPassword(req, res){
        UserReset.findOne({ email: req.body.email, reset_code: req.body.reset_code })
            .then(async result => {
                if(!result){
                    return res.json({
                        success: false,
                        message: "Reset code not found.",
                        res_code: 403,
                        res_status: "RESET_CODE_NOT_FOUND"
                    })
                }
                let newPassword = bcrypt.hashSync(req.body.password, 8)
                await User.updateOne({email: result.email}, {password: newPassword})
                    .then(() =>{
                        res.status(200).json({
                            success: true,
                            message: 'Change password successfull',
                            res_code: 200,
                            res_status: "CHANGE_PASSWORD_SUCCESSFULLY"
                        });
                        UserReset.deleteOne({email : result.email})
                        .then(res => {
                        })
                        .catch(err =>{
                        })
                    })
                    .catch(err => {
                        res.json({
                            success: false,
                            message: 'Server error. Please try again.',
                            error: err.message,
                            res_code: 500,
                            res_status: "SERVER_ERROR"
                        });
                    })
            })
    }
}

module.exports = new forgotPassword