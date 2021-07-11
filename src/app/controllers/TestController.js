const mongoose = require('mongoose');
const ClassNews = require('../models/ClassNews');
const Comment = require('../models/Comment')
const Notification = require('../models/Notification')
async function cc(req, res){
    try{
        let a =[]
        a = await Comment.aggregate([
                {
                    "$match": {
                        "ref": mongoose.Types.ObjectId('60d86fe1c70d0f36e0ebca16'),
                        'is_delete': false,
                            'onModel': 'ClassHomework'
                    }
                },
               {
                "$group": {
                    _id: '$user' 
                }
               } 
                
        ])
        const b = JSON.parse(JSON.stringify([]))
        const c = b.map(item => {return item._id})
        const d = c.filter(item => {
            return item != '60c40f6df6966008d82459af'
        })
        console.log(a.length)
        res.json(a)
    }
    catch(err){
        console.log(err)
    }
}

async function ccc(req, res){
    try{
        const a = await User.find();
        res.json(a)
    }
    catch(err){
        console.log(err)
    }
}


module.exports = {
    cc,
    ccc
}