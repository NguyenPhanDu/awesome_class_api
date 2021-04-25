const coursesRouter = require('./courses')
function route(app){
    app.use('/courses',coursesRouter)
}

module.exports = route;