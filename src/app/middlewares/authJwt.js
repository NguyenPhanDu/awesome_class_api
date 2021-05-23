const secretKeyJwt = require('../../config/auth')
const jwt = require('jsonwebtoken');
const passport = require('passport');

// API JWT
verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if(token == null){
        return res.json({
            success: false,
            message: 'No token provided!',
            res_code: 401,
            res_status: "NO_TOKEM_PROVIED"
        })
    }
    jwt.verify(token, secretKeyJwt.secret, (error, user)=>{
            if (error) {
                return res.json({
                    success: false,
                    message: "Unauthorized!" ,
                    res_code: 401,
                    res_status: "UNAUTHORIZED"
                });
            }
            if(user.email){
                res.locals.email = user.email;
                res.locals._id = user._id;
                next();
            }
            else{
                return res.json({
                    success: false,
                    message: 'Unauthorized, cant find you user',
                    res_code: 401,
                    res_status: "UNAUTHORIZED"
                })
            }
            
    })

};

// PASSPORT AUTH MVC
passportCheckAuthenticated = (req, res, next) => {
    if(!req.isAuthenticated()){
        return res.redirect('/admin/login');
    }
    next();
}

passportCheckNotAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return res.redirect('/admin/');
    }
    next();
}

module.exports = {verifyToken, passportCheckAuthenticated , passportCheckNotAuthenticated}