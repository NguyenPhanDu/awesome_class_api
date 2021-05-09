const coursesRouter = require('./courses')
const userTypeRouter = require('./user_type');
const authRouter = require('./auth');
const activeRouter = require('./active_mail');
const forgotPasswordRouter = require('./forgot_password');
function route(app){
    app.use('/courses',coursesRouter)
    app.use('/api/user_type',userTypeRouter)
    app.use('/api/auth/',authRouter);
    app.use('/auth/',activeRouter);
    app.use('/api/forgot-password',forgotPasswordRouter);
}

module.exports = route;