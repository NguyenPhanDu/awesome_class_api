const coursesRouter = require('./courses')
const userTypeRouter = require('./user_type');
const authRouter = require('./auth');
const activeRouter = require('./active_mail');
const forgotPasswordRouter = require('./forgot_password');
const userProfileRouter = require('./user_profile');
const AuthController = require('../app/api/controllers/AuthAPIController')

function route(app){
    app.get('/api/user/:id',AuthController.getUser);
    app.use('/courses',coursesRouter);
    app.use('/api/user_type',userTypeRouter);
    app.use('/api/auth/',authRouter);
    app.use('/auth/',activeRouter);
    app.use('/api/forgot-password',forgotPasswordRouter);
    app.use('/api/user-profile',userProfileRouter);
}

module.exports = route;