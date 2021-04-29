const mongoose = require('mongoose');
const User = require('../../models/User');
const UserType = require('../../models/UserType');
const bcrypt = require('bcrypt');

class UserController{
    async signUp(req, res){
        let user_type_id;
        await UserType.findOne({ id_user_type: 2 })
        .then(result=>{
            user_type_id = result._id;
        })
        // const emailToValidate = req.body.email;
        // const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        // if(await emailRegexp.test(emailToValidate) == false){
        //     return res.status(402).json({
        //         success: false,
        //         message: "Email not đúng format"
        //     });
        // }
        
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            user_type:  mongoose.Types.ObjectId(user_type_id)
        });
        await user.save()
            .then(newUser => {
                newUser = newUser.toObject();
                res.status(200).json({
                    success: true,
                    message: "Sign up successfull!",
                    data: newUser
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
};

module.exports = new UserController;