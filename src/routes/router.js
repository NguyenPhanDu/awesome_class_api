const coursesRouter = require('./courses')
const userTypeRouter = require('./user_type');
const authRouter = require('./auth');
const activeRouter = require('./active_mail');

function route(app){
    app.use('/courses',coursesRouter)
    app.use('/api/user_type',userTypeRouter)
    app.use('/api/auth/',authRouter);
    app.use('/auth/',activeRouter)
}

module.exports = route;