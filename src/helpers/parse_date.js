function parseTimeFormMongo(time){
    return  time.slice(0,10)+" "+time.slice(11,20)
}

module.exports = {
    parseTimeFormMongo
}