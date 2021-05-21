const path = require('path');
const express = require('express');
const userTypeRouter = require('./modules/user_type');
const authRouter = require('./modules/auth');
const activeRouter = require('./modules/active_mail');
const forgotPasswordRouter = require('./modules/forgot_password');
const userProfileRouter = require('./modules/user_profile');
const AuthController = require('../app/api/controllers/AuthAPIController');
const ClassRouter = require('./modules/class');
const ClassMemberRouter = require('./modules/class_member');
const ChangePasswordRouter = require('./modules/change_password');

function route(app){
    app.get('/api/user/:id',AuthController.getUser);
    app.use('/api/user_type',userTypeRouter);
    app.use('/api/auth/',authRouter);
    app.use('/auth/',activeRouter);
    app.use('/api/forgot-password',forgotPasswordRouter);
    app.use('/api/user-profile',userProfileRouter);
    app.use('/api/class/',ClassRouter);
    app.use('/api/change-password', ChangePasswordRouter);
    app.use('/api/class-member/',ClassMemberRouter);
}

module.exports = route;