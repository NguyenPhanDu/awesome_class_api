const drive = require('../../config/google_drive/index');
const Directory = require('../models/Directory');
const File = require('../models/File');
const mongoose = require('mongoose');

async function createFoler(name, parent, id){
    try{
        const response = await drive.files.create({
            resource: {
                'name': name,
                'mimeType': 'application/vnd.google-apps.folder',
                parents: [parent.id]
            }
        })
        let path;
        if(parent){
            path = parent.path+name
        }
        else{
            path = '/'+name+'/'
        }
        console.log(response.data)
        const newDirectory = new Directory({
            id_folder: response.data.id,
            name: response.data.name,
            refId: mongoose.Types.ObjectId(id),
            mimeType: response.data.mimeType,
            path: path
        })
        await newDirectory.save()
        .then(result => {
            console.log('create folder successfully');
        })
        .catch(err => {
            console.log(err)
        })
    }
    catch(err){
        console.log(err)
    }
};

async function deleteFolder(idFolder, refId){
    try{
        const response = await drive.files.delete({
            fileId: idFolder
        })
        console.log(response.status);
        let path;
        await Directory.findOne({refId: refId, is_deltete: false})
            .then(result => {
                path = result.path
                return path;
            })
            .then(async path => {
                await Directory.updateMany({path: /path/, is_deltete: false}, { is_deltete: true })
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
                await File.find({path: /path/, is_deltete: false})
                    .then(async result => {
                        if(result.length > 0){
                            await File.updateMany({path: /path/, is_deltete: false}, { is_deltete: true })
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
            })
    }
    catch(err){
        console.log(err)
    }
  }

module.exports = {
    createFoler,
    deleteFolder
}