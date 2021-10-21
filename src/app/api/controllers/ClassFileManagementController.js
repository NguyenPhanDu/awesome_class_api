const _ = require("lodash");
const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const File = require('../../models/File');
const ClassRole = require('../../models/ClassRole');
const ClassMember = require('../../models/ClassMember');
const FolderClass = require('../../models/FolderClass');

//req.body.id_class
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
            .populate([
                {
                    path: 'parent',
                    populate: {
                        path: 'class',
                        match: { id_class : { $eq : req.body.id_class } }
                    }
                },
                {
                    path: 'create_by'
                }
            ])
            let list = JSON.parse(JSON.stringify(listFile));
            let resutl = [];
            if(list.length > 0){
                list = list.filter(item => {
                    return item.parent.class != null
                });
                resutl = _.map(list, (obj) => {
                    return _.omit(
                        obj,
                        [
                            'parent', '_id', 'ref', 'id_file', '__v', 'createdAt', 'updatedAt',
                            'create_by._id', 'create_by.activated_code', 'create_by.activated', 'create_by.status', 
                            'create_by.password', 'create_by.createdAt', 'create_by.updatedAt',
                            'create_by.user_type', 'create_by.social', 'create_by.social_id', 'create_by.__v'
                        ]
                    )
                })
            }
            res.json({
                success: true,
                message: "get all file in class successfull!",
                data: resutl,
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
        let z = [
            {
                "path": "",
                "is_delete": false,
                "_id": "616d8b75f180461b0f143934",
                "id_folder": "1Xtk5loA56UPq37o9u8uO2NE8wIi-0WJi",
                "name": "47",
                "class": {
                    "is_delete": true,
                    "description": "abcaccbegegeg",
                    "category": "abc",
                    "image": "",
                    "_id": "616d8b74f180461b0f14392d",
                    "admin": "60c40f6df6966008d82459af",
                    "name": "abc",
                    "class_code": "9jYvgm",
                    "permission": "616d8b74f180461b0f143929",
                    "createdAt": "2021-10-18T14:57:56.243Z",
                    "updatedAt": "2021-10-20T11:09:43.968Z",
                    "id_class": 47,
                    "__v": 0
                },
                "createdAt": "2021-10-18T14:57:57.108Z",
                "updatedAt": "2021-10-18T14:57:57.108Z",
                "id_folder_class": 32,
                "__v": 0
            },
            {
                "path": "",
                "is_delete": false,
                "_id": "616d8b75f180461b0f143934",
                "id_folder": "1Xtk5loA56UPq37o9u8uO2NE8wIi-0WJi",
                "name": "47",
                "class": {
                    "is_delete": true,
                    "description": "abcaccbegegeg",
                    "category": "abc",
                    "image": "",
                    "_id": "616d8b74f180461b0f14392d",
                    "admin": "60c40f6df6966008d82459af",
                    "name": "abc",
                    "class_code": "9jYvgm",
                    "permission": "616d8b74f180461b0f143929",
                    "createdAt": "2021-10-18T14:57:56.243Z",
                    "updatedAt": "2021-10-20T11:09:43.968Z",
                    "id_class": 47,
                    "__v": 0
                },
                "createdAt": "2021-10-18T14:57:57.108Z",
                "updatedAt": "2021-10-18T14:57:57.108Z",
                "id_folder_class": 32,
                "__v": 0
            },
            {
                "path": "",
                "is_delete": false,
                "_id": "616d8b75f180461b0f143934",
                "id_folder": "1Xtk5loA56UPq37o9u8uO2NE8wIi-0WJi",
                "name": "47",
                "class": {
                    "is_delete": true,
                    "description": "abcaccbegegeg",
                    "category": "abc",
                    "image": "",
                    "_id": "616d8b74f180461b0f14392d",
                    "admin": "60c40f6df6966008d82459af",
                    "name": "abc",
                    "class_code": "9jYvgm",
                    "permission": "616d8b74f180461b0f143929",
                    "createdAt": "2021-10-18T14:57:56.243Z",
                    "updatedAt": "2021-10-20T11:09:43.968Z",
                    "id_class": 47,
                    "__v": 0
                },
                "createdAt": "2021-10-18T14:57:57.108Z",
                "updatedAt": "2021-10-18T14:57:57.108Z",
                "id_folder_class": 32,
                "__v": 0
            }
        ]

        let folder = await FolderClass.findOne({ is_delete: false, id_folder_class: req.body.id_folder_class})
        .populate({
            path: 'class'
        });
        
        const a =  _.map(z, (obj) => {
            return _.omit(obj,['class.description'])
        })
        res.json(
            req.class
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