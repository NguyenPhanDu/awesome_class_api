const mongoose = require('mongoose');
const User = require('../models/User');
const UserType = require('../models/UserType');
class UserController{
    // GET 
    async index(req,res, next){
        let userTypeId;
        await UserType.findOne({ id_user_type: 2 })
        .then(result=>{
            userTypeId = result._id;
        })
        await User.find({user_type : mongoose.Types.ObjectId(userTypeId)})
            .populate('user_type')
            .then(users => {
               let newUsers = JSON.parse(JSON.stringify(users));
               for(let user of newUsers){
                   delete user.password;
               }
               return newUsers;
            })
            .then(newUsers => {
                res.render('user/nomarl_user/index', {userAuth : req.user , users: newUsers});
            })
            .catch(next);
    }
}

module.exports = new UserController;