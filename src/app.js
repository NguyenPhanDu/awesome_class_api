const express = require('express');
const morgan = require('morgan');
const handlebars  = require('express-handlebars');
const methodOverride = require('method-override');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require("helmet");
require('dotenv').config();

//import database 
const db = require('./config/db/index');
//connect db
db.connect();

const app = express();

// CORS
app.use(cors())
// HELMET
app.use(helmet());

// BODY PARSER
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
//MEDTHOD OVERRIDE
app.use(methodOverride('_method'))
//MORGAN
app.use(morgan('tiny'));

app.use(express.static(path.join(__dirname,'public')));
console.log(path.join(__dirname, 'public'))
// VIEW ENGINE
app.engine('hbs', handlebars({extname: '.hbs'}));
app.set('view engine', 'hbs');

app.set('views', path.join(__dirname,'resources', 'views'))
//Route
const route = require('./routes/router')
route(app);

app.listen(process.env.PORT, () => {
  console.log(`App listening at http://localhost:${process.env.PORT}`)
})