const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const HomeworkType = require('../../models/HomeworkType');
const NormalHomework = require('../../models/NormalHomework');
const ClassMember = require('../../models/ClassMember');
const ClassHomework = require('../../models/ClassHomework');
const HomeworkAssign = require('../../models/HomeworkAssign');
const ClassRole = require('../../models/ClassRole');
const HomeworkCategory = require('../../models/HomeworkCategory');
const FolerServices = require('../../services/file_and_folder/index');
const Comment = require('../../models/Comment');
const File = require('../../models/File');
const NotificationController = require('./NotificationController');
const FavourateHomework = require('../../models/FavouriteHomework');
const moment = require('moment');
const { parseTimeFormMongo } = require('../../../helpers/parse_date');

const Test = require('../../models/Test');

async function test(req, res){
    try{
        const users = await User.find({ activated: true });
        res.json()    
    }
    catch(err){
        console.log(err)
    }
}

module.exports = {
    test
}