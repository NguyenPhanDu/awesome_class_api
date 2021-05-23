const passport = require('passport');
class LoginController{
    getLogin(req, res){
        res.render('login',{layout: false})
    }
    postLogin(req, res){
        
    }

    logOut(req, res){
        req.logout();
        res.redirect('/admin/login');
    }
}
module.exports = new LoginController;