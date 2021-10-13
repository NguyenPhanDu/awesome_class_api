const express = require('express');
const morgan = require('morgan');
const handlebars  = require('express-handlebars');
const methodOverride = require('method-override');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require("helmet");
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const multer = require('multer');
global.__basedir = __dirname;
require('dotenv').config();

//import database 
const db = require('./config/db/index');
//connect db
db.connect();

const app = express();
// Socketio
var server = require('http').createServer(app);  
var io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
app.set('socketio', io);
// CORS
app.use(cors())
// HELMET
app.use(helmet());

// BODY PARSER
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));


//MEDTHOD OVERRIDE
app.use(methodOverride('_method'))
//MORGAN
app.use(morgan('tiny', {
  skip: function(req, res) {
    console.log(req.originalUrl);
    return req.path.includes('notification');
  }
}));
//PASSPORT
app.use(flash());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

//STATIC FILE
app.use(express.static(path.join(__dirname,'public')));
// VIEW ENGINE
app.engine('hbs', handlebars({extname: '.hbs'}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname,'resources', 'views'))
//Route
const route = require('./routes/router');
route(app);

const socketIo = require('./app/services/socket/index');
socketIo(io);

server.listen(process.env.PORT, () => {
  console.log(`App listening at http://localhost:${process.env.PORT}/admin/login`);
})