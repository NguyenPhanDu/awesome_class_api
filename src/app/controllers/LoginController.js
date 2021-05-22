// const express = require('express');
// const path = require('path');
// const app = express();

// app.use(express.static(path.join(__dirname,'public')));
class LoginController{
    getLogin(req, res){
        res.render('login',{layout: false})
    }
    postLogin(req, res){
        
    }
}
module.exports = new LoginController;