const userTypeRouter = require('./user_type');
const authRouter = require('./auth');
const activeRouter = require('./active_mail');
const forgotPasswordRouter = require('./forgot_password');
const userProfileRouter = require('./user_profile');
const AuthController = require('../app/api/controllers/AuthAPIController');
const ClassRouter = require('./class');
const ClassMemberRouter = require('./class_member');
const ChangePasswordRouter = require('./change_password');

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