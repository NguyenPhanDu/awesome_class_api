const UserType = require('../models/UserType');
const User = require('../models/User')
const Class = require('../models/Class');
async function limitClassCreation(req, res, next){
    try{
        const user = await User.findOne({ email : res.locals.email })
        .populate({
            path: 'user_type'
        });
        const amountClass = await Class.countDocuments({ admin:  user._id, is_delete: false});
        // đếm số lớp nó tạo nếu 
        if(user.user_type.id_user_type == 2){
            if(amountClass > 20){
                return res.json({
                    success: false,
                    message: "Limit 20 classes creation in your account!",
                    res_status: "LIMIT_CLASS_NORMAL"
                });
            }
            else{
                next();
            }
        }
        else if(user.user_type.id_user_type == 3){
            if(amountClass > 100){
                return res.json({
                    success: false,
                    message: "Limit 100 classes creation in your account!",
                    res_status: "LIMIT_CLASS_NORMAL"
                });
            }
            else{
                next();
            }
        }
        else{
            next();
        }
    }
    catch(err){
        console.log(err);
        res.json({
            success: false,
            message: 'Server error. Please try again',
            error: err,
            res_code: 500,
            res_status: "SERVER_ERROR"
        });
    }
}

module.exports = {
    limitClassCreation
}