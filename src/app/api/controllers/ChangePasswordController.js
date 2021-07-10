const User = require('../../models/User');
const bcrypt = require('bcrypt');

class ChangePasswordController{
    // bỏ
    async changePass(req, res){
        await User.findOne({email : req.body.email})
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

            })
            .catch(error =>{
                return res.json({
                    success: false,
                    message: error,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                })
            })
        let query = {email: req.body.email};
        let update = 
            {
                password: bcrypt.hashSync(req.body.new_password,8)
            };
        let option = {new: true}
        await User.findOneAndUpdate(query, update, option)
            .populate('user_type')
            .then(user => {
                return res.json({
                    success: true,
                    message: "Change password successfull!",
                    res_code: 200,
                    res_status: "CHANGE_PASSWORD_SUCCESSFULLY"
                })
            })
            .catch(err => {
                return res.json({
                    success: false,
                    message: err,
                    res_code: 500,
                    res_status: "SERVER_ERROR"
                })
            })
    }

    async changePassword(req, res){
        try{
            const user = await User.findOne({email : req.body.email});
            if(user.social != ''){
                return res.json({
                    success: true,
                    message: "Social account can't change password",
                    res_code: 200,
                    res_status: "FAILED"
                })
            }
            else{
                let passwordIsValid = bcrypt.compareSync(req.body.password,user.password)
                if(!passwordIsValid){
                    return res.json({
                        success: false,
                        message: "Wrong password",
                        res_code: 403,
                        res_status: "WRONG_PASSWORD"
                    })
                }
                else{
                    let query = {email: req.body.email};
                    let update = 
                        {
                            password: bcrypt.hashSync(req.body.new_password,8)
                        };
                    let option = {new: true}
                    await User.findOneAndUpdate(query, update, option)
                    return res.json({
                        success: true,
                        message: "Change password successfull!",
                        res_code: 200,
                        res_status: "CHANGE_PASSWORD_SUCCESSFULLY"
                    })
                }
            }
        }
        catch(err){
            console.log(err)
            res.json({
                success: false,
                message: 'Server error. Please try again',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return;
        }
    }
}

module.exports = new ChangePasswordController