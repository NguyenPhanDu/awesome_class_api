const coursesRouter = require('./courses')
const userTypeRouter = require('./user_type');
const authRouter = require('./auth');
function route(app){
    app.use('/courses',coursesRouter)
    app.use('/api/user_type',userTypeRouter)
    app.use('/api/auth/',authRouter)
}

module.exports = route;