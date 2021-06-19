const mongoose = require('mongoose');
const drive = require('../../../config/google_drive/index');
const Folder = require('../../models/Folder');
const FolderClass = require('../../models/FolderClass');
const FolderClassNews = require('../../models/FolderClassNews');
const File = require('../../models/File');
const ClassNews = require('../../models/ClassNews');
const fs = require('fs');

async function createFolerClassNews(userId, classId, classNews){
    try{
        const parentFolder = await FolderClass.findOne({ create_by: mongoose.Types.ObjectId(userId), class: mongoose.Types.ObjectId(classId), is_delete: false })
        .populate('folder');
        // create foler in gooler drive
        const folerDrive = response = await drive.files.create({
            resource: {
                'name': classNews.id_class_news,
                'mimeType': 'application/vnd.google-apps.folder',
                parents: [parentFolder.folder.id_folder]
            }
        });
        let path = parentFolder.folder.path+'/news/'+classNews.id_class_news+'/';
        const folderchema = new Folder({
            id_folder: folerDrive.data.id,
            name: folerDrive.data.name,
            path: path,
            level: 3,
            type: 2,
            parent: parentFolder.folder._id
        });
        const newClassNewsFolder = await folderchema.save();
        await FolderClassNews.create({
            create_by: mongoose.Types.ObjectId(userId),
            class: mongoose.Types.ObjectId(classId),
            class_news: mongoose.Types.ObjectId(classNews._id),
            folder: mongoose.Types.ObjectId(newClassNewsFolder._id),
            level: 3,
            type: 2
        });
    }
    catch(err){
        console.log(err);
        return
    }
}

async function uploadFileNews(userId, classId, classNews, file){
    try{
        // Tìm folder news chứa các file sẽ upload
        const folderClassNews = await FolderClassNews.findOne(
            {
                is_delete: false,
                class: mongoose.Types.ObjectId(classId),
                class_news: mongoose.Types.ObjectId(classNews._id),
                level: 3,
                type: 2
            }
        ).populate('folder');
        // Upload file lên drive
        const fileCreateByDrive = await drive.files.create({
            resource: {
                name: file.originalname,
                mimetype: file.mimetype,
                parents: [folderClassNews.folder.id_folder]
            },
            media: {
                mimeType: file.mimetype,
                body: fs.createReadStream(file.path)
            }
        });
        // Chia sẽ file
        await drive.permissions.create({
            fileId: fileCreateByDrive.data.id,
            requestBody:{
                role: 'reader',
                type: 'anyone'
            }
        });
        const linkFileDirve = await drive.files.get({
            fileId: fileCreateByDrive.data.id,
            fields: 'webViewLink, webContentLink'
        });
        let pathFile= folderClassNews.folder.path+fileCreateByDrive.data.name.replace(/\s+/g, '')+'/';
        const newFile = await File.create({
            class_news: mongoose.Types.ObjectId(classNews._id),
            class: mongoose.Types.ObjectId(classId),
            create_by: mongoose.Types.ObjectId(userId),
            type: 2,
            id_file: fileCreateByDrive.data.id,
            name: fileCreateByDrive.data.name,
            mimeType: fileCreateByDrive.data.mimetype,
            parent: mongoose.Types.ObjectId(folderClassNews.folder._id),
            path: pathFile,
            level: 4,
            viewLink: linkFileDirve.data.webViewLink,
            downloadLink: linkFileDirve.data.webContentLink,
            size: file.size
        });
        await ClassNews.findByIdAndUpdate(classNews._id, 
            {
                $push: {document: newFile._id}
            }
        );
        await fs.unlinkSync(file.path);
    }
    catch(err){
        console.log(err);
        return;
    }
}
async function deleteFolderClassNews(classId, classNews){
    try{
        const folderClassNews = await FolderClassNews.findOne(
            {
                is_delete: false,
                class: mongoose.Types.ObjectId(classId),
                class_news: mongoose.Types.ObjectId(classNews._id),
                level: 3,
                type: 2
            }
        ).populate('folder');
        let path = folderClassNews.folder.path
        await FolderClassNews.findByIdAndUpdate(
            folderClassNews._id,
            {
                is_delete: true
            }
        );
        const arrayFolerIsFolderClassNews = await Folder.find({path: { $regex: '.*' + path + '.*' }, is_delete: false})
        if(arrayFolerIsFolderClassNews.length> 0){
            await Folder.updateMany({path: { $regex: '.*' + path + '.*' }, is_delete: false}, { is_delete: true });
        }
        const arrayFileOfNews = await File.find({path: { $regex: '.*' + path + '.*' }, is_delete: false});
        if(arrayFileOfNews.length > 0){
            await File.updateMany({path: { $regex: '.*' + path + '.*' }, is_delete: false}, { is_delete: true })
        }      

    }
    catch(err){
        console.log(err);
        return;
    }
}

module.exports = {
    createFolerClassNews,
    uploadFileNews,
    deleteFolderClassNews
}

