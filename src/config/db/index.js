const mongoose = require('mongoose');
require('dotenv').config();

async function connect(){
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log("connect successfully")
    }
    catch(error){
        console.log("connect failed")
    }
}

module.exports = {connect}