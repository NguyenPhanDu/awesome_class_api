const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const HomeworkType = require('../../models/HomeworkType');
const NormalHomework = require('../../models/NormalHomework');
const ClassMember = require('../../models/ClassMember');

class HomeWorkController{
    async createNormalHomework(req, res){
        const user = await User.findOne({ email: req.body.email});
        const classes = await Class.findOne( { id_class: Number(req.body.id_class) } );
        console.log(classes._id)
        const classMember = await ClassMember.findOne({
            class : mongoose.Types.ObjectId(classes._id),
            is_delete : false
        });
        console.log(classMember);
    }
}

module.exports = new HomeWorkController;