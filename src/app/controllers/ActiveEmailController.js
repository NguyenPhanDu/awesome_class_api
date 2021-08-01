const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();
class ActiveEmail{
    ActiveAccount(req, res){
        User.findOne({id_user: req.query.id})
            .then(user =>{
                if(!user){
                    return res.json({
                        success: false,
                        message: "Email Not found.",
                        res_code: 403,
                        res_status: "EMAIL_NOT_FOUND"
                    })
                }
                if(user.activated == true){
                    return res.json({
                        success: false,
                        message: "Email is activated.",
                        res_code: 401,
                        res_status: "EMAIL_IS_ACTIVATED"
                    })
                }
                if(req.query.active_code == user.activated_code){
                    User.updateOne({id_user: user.id_user},{activated: true})
                        .then(userUpdated =>{
                            res.redirect(`${process.env.ENDPOINTFE}`)
                        })
                }
            })
    }
}



module.exports = new ActiveEmail