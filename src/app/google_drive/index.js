const drive = require('../../config/google_drive/index');
const Directory = require('../models/Directory');
const File = require('../models/File');
const { promisify } = require('util');
const fs = require("fs");
const unlinkAsync = promisify(fs.unlink);
const mongoose = require('mongoose');
const NormalHomework = require('../models/NormalHomework');

async function createClassFoler(name, id){
    try{
        const response = await drive.files.create({
            resource: {
                'name': name,
                'mimeType': 'application/vnd.google-apps.folder',
            }
        })
        console.log(response.data);
        
        let path = '/'+name.replace(/\s+/g, '')+'/'
        const newDirectory = new Directory({
            id_folder: response.data.id,
            name: response.data.name,
            refId: id,
            mimeType: response.data.mimeType,
            path: path
        })
        await newDirectory.save()
        .then(result => { 
            console.log('create folder successfully');
            return result;
        })
        .catch(err => {
            console.log(err)
        })
    }
    catch(err){
        console.log(err)
    }
};

async function createHomeworkFolder(name, id, parent){
    try{
        let folder;
        const response = await drive.files.create({
          resource: {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder',
            parents: [parent.id_folder]
          }
        })
        console.log(response.data)
        let path = parent.path+name.replace(/\s+/g, '')+'/'
        const newDirectory = new Directory({
            id_folder: response.data.id,
            name: response.data.name,
            refId: id,
            mimeType: response.data.mimeType,
            path: path,
            parent: mongoose.Types.ObjectId(parent._id)
        })
        await newDirectory.save()
            .then(result => {
                folder = result;
                return folder
            })
            .then(async folder => {
                const response2 = await drive.files.create({
                    resource: {
                      'name': 'Teacher',
                      'mimeType': 'application/vnd.google-apps.folder',
                      parents: [folder.id_folder]
                    }
                })
                let path = folder.path+'Teacher/'
                await Directory.create({
                    id_folder: response2.data.id,
                    name: response2.data.name,
                    refId: id,
                    mimeType: response2.data.mimeType,
                    path: path,
                    parent: mongoose.Types.ObjectId(folder._id)
                })
                .then(result => {
                    console.log('create teacher folder!')
                })
                .catch(err => {
                    console.log(err)
                });
                return folder;
            })
            .then(async folder => {
                const response3 = await drive.files.create({
                    resource: {
                      'name': 'Student',
                      'mimeType': 'application/vnd.google-apps.folder',
                      parents: [folder.id_folder]
                    }
                })
                let path = folder.path+'Student/'
                await Directory.create({
                    id_folder: response3.data.id,
                    name: response3.data.name,
                    refId: id,
                    mimeType: response3.data.mimeType,
                    path: path,
                    parent: mongoose.Types.ObjectId(folder._id)
                })
                .then(result => {
                    console.log('create Student folder!')
                })
                .catch(err => {
                    console.log(err)
                });
                return folder;
            })
            .catch(err => {
                console.log(err)
            });      
    }
    catch(err){
        console.log(err)
    }
}

async function deleteFolder(refId){
    try{
        let path;
        let folderId;
        await Directory.findOne({refId: refId, is_delete: false})
            .then(result => {
                path = result.path;
                folderId = result.id_folder;
                return path;
            })
            .then(async path => {
                console.log(path)
                await Directory.updateMany({path: { $regex: '.*' + path + '.*' }, is_delete: false}, { is_delete: true })
                .then(result => {
                    console.log('delete foler!')
                })
                .catch(err => {
                    console.log(err);
                    return;
                })
                return path;
            })
            .then(async path => {
                await File.find({path: { $regex: '.*' + path + '.*' }, is_delete: false})
                    .then(async result => {
                        if(result.length > 0){
                            await File.updateMany({path: { $regex: '.*' + path + '.*' }, is_delete: false}, { is_delete: true })
                            .then(result => {
                                console.log('delete file');
                            })
                            .catch(err => {
                                console.log(err);
                            })
                        }
                        console.log('delete file');
                    })
            })
            .catch(err => {
                console.log(err)
            });
    }
    catch(err){
        console.log(err)
    }
}

async function uploadFile (files, homework){
    for(let i =0; i<files.length;i++){
        let folderHomework;
            await Directory.findOne({refId: homework._id, name: 'Teacher', is_delete: false})
            .then(result => {
                folderHomework = result
            })
        await drive.files.create({
            resource: {
                name: files[i].originalname,
                mimetype: files[i].mimetype,
                parents: [folderHomework.id_folder]
            },
            media: {
                mimeType: files[i].mimetype,
                body: fs.createReadStream(files[i].path)
            }
        })
        .then(async result => {
            console.log(result.data);
            let id = result.data.id;
            let name = result.data.name;
            let mineType = result.data.mineType;
            let path = folderHomework.path+result.data.name
            let viewLink;
            let downloadLink;
            await drive.permissions.create({
                fileId: result.data.id,
                requestBody:{
                    role: 'reader',
                    type: 'anyone'
                }
            });
            await drive.files.get({
                fileId: result.data.id,
                fields: 'webViewLink, webContentLink'
            })
            .then(result => {
                viewLink = result.data.webViewLink,
                downloadLink = result.data.webContentLink
            });
            await File.create({
                id_file: id,
                name: name,
                parent: folderHomework._id,
                path: path,
                mimeType: mineType,
                viewLink: viewLink,
                downloadLink: downloadLink,
                size: files[i].size
            })
            .then(async result => {
                console.log("create File!")
                await NormalHomework.findByIdAndUpdate(
                    homework._id,
                    {
                        $push: {document: result._id}
                    },
                    {new: true}
                )
            })
        })
        .catch(err => {
            console.log(err);
        })
        await unlinkAsync(files[i].path);
    }
}

module.exports = {
    createClassFoler,
    createHomeworkFolder,
    deleteFolder,
    uploadFile
}