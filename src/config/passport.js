const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../app/models/User');
const UserType = require('../app/models/UserType');
const mongoose = require('mongoose');

let initPassportLocal = () => {
    passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback : true
    }, async (req, email, password, done) => {
        try{
            let user_type_id;
            await UserType.findOne({ id_user_type: 1 })
                .then(result=>{
                    user_type_id = result._id;
                })
            await User.findOne({email: email, user_type: mongoose.Types.ObjectId(user_type_id)})
                .populate('user_type')
                .then(async user => {
                    if(!user){
                        return done(null, false, {message: 'Incorrect email.'});
                    }
                    let passwordIsValid = await bcrypt.compareSync(password,user.password);
                    if(!passwordIsValid){

                        return done(null, false, {message: 'Incorrect password.'});
                    }
                    return done(null, user);
                })
                .catch(err =>{
                    console.log("errrrrrrrrrrrrrrrrr")
                    return done(null, false);
                })
        }
        catch(err){
            console.log(err);
            return done(null, false,);
        }
    }));
    passport.serializeUser(function(user, done) {
        done(null, user._id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id)
            .then(user => {
                let userNew = JSON.parse(JSON.stringify(user));
                delete userNew.password;
                done(null, userNew);
            })
            .catch(function (err) {
                console.log(err);
            })
      });
};

module.exports = initPassportLocal;