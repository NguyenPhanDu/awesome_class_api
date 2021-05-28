const mongoose = require('mongoose');
const User = require('../models/User');

class UserController{
    // GET 
    async index(req,res, next){
        await User.find({})
            .populate('user_type')
            .then(users => {
               let newUsers = JSON.parse(JSON.stringify(users));
               for(let user of newUsers){
                   delete user.password;
               }
               return newUsers;
            })
            .then(newUsers => {
                res.render('user/index', {user : req.user , users: newUsers});
            })
            .catch(next);
    }
}

module.exports = new UserController;