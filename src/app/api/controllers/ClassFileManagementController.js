const lodash = require('lodash');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const File = require('../../models/File');
const ClassRole = require('../../models/ClassRole');
const ClassMember = require('../../models/ClassMember');
const FolderClass = require('../../models/FolderClass');
async function showAllFileInClass(req, res){
    try{
        const user = await User.findOne({ email: req.body.email });
        const classRoleStudent = await ClassRole.findOne({id_class_role : 2})
        const classes = await Class.findOne({ id_class: req.body.id_class })
        const classMemer = await ClassMember.findOne({ class: classes._id, user: user._id, is_delete: false });
        if(classMemer.role == classRoleStudent._id){
            res.json({
                success: false,
                message: "No access",
                res_code: 403,
                res_status: "NO_ACCESS"
            })
        }
        else{
            let listFile = await File.find({ is_delete: false })
            .populate({
                path: 'parent',
                populate: {
                    path: 'class',
                    match: { id_class : { $eq : req.body.id_class } }
                }
            });
            JSON.parse(JSON.stringify(listFile))
            if(listFile.length > 0){
                listFile = listFile.filter(item => {
                    return item.parent.class != null
                });
            }
            res.json({
                success: true,
                message: "get all file in class successfull!",
                data: listFile,
                res_code: 200,
                res_status: "GET_ALL_SUCCESSFULLY"
            })
        }
    }
    catch(err){
        console.log(err);
            res.json({
                success: false,
                message: 'Server error. Please try again',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return;
    }
}

async function testThoi(req, res){
    try{
        let folder = await FolderClass.findOne({ is_delete: false, id_folder_class: req.body.id_folder_class})
        .populate({
            path: 'class'
        });
        
        const a =  lodash.omit(folder.toJSON(),['name', 'class'])
        res.json(
            a
        )
    }
    catch(err){
        console.log(err);
        res.json({
            success: false,
            message: 'Server error. Please try again',
            error: err,
            res_code: 500,
            res_status: "SERVER_ERROR"
        });
    }
}

module.exports = { 
    showAllFileInClass,
    testThoi
}