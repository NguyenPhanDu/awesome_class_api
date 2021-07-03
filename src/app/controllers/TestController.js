const ClassNews = require('../models/ClassNews');

async function cc(req, res){
    try{
        const aa = await ClassNews.find().populate('homework').populate('user').populate('ccc')
        res.json(aa)
    }
    catch(err){
        console.log(err)
    }
}

module.exports = {
    cc
}