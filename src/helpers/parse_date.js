const moment = require('moment');

function parseTimeFormMongo(time){
    return  time.slice(0,10)+" "+time.slice(11,20)
}

function changeTimeInDBToISOString(time){
    let date = new Date(time);
    return moment(date).toISOString();
}

function changeTimeNowToISOString(time){
    return moment(time, 'DD-MM-YYYY HH:mm:ss').toISOString();
}

module.exports = {
    parseTimeFormMongo,
    changeTimeInDBToISOString,
    changeTimeNowToISOString
}