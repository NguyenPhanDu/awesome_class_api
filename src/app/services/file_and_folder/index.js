const mongoose = require('mongoose');
const drive = require('../../../config/google_drive/index');
const FolderClass = require('../../models/FolderClass');
const File = require('../../models/File');
const NormalHomework = require('../../models/NormalHomework');
const ClassNews = require('../../models/ClassNews');
const SubmitHomework = require('../../models/SubmitHomework');
const fs = require('fs');
// upload file ở model class homework
async function uploadFileCreateHomeWork(userId, classId, classHomework, file, normalHomeworkId){
    try{
        const folderClass = await FolderClass.findOne({ class: mongoose.Types.ObjectId(classId), is_delete: false })
        const fileCreateByDrive = await drive.files.create({
            resource: {
                name: file.originalname,
                mimetype: file.mimetype,
                parents: [folderClass.id_folder]
            },
            media: {
                mimeType: file.mimetype,
                body: fs.createReadStream(file.path)
            }
        });
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
        const newFile = await File.create({
            ref: mongoose.Types.ObjectId(classHomework._id),
            onModel: "ClassHomework",
            create_by: mongoose.Types.ObjectId(userId),
            type: "ClassHomework",
            id_file: fileCreateByDrive.data.id,
            name: fileCreateByDrive.data.name,
            mimeType: fileCreateByDrive.data.mimetype,
            parent: mongoose.Types.ObjectId(folderClass._id),
            viewLink: linkFileDirve.data.webViewLink,
            downloadLink: linkFileDirve.data.webContentLink,
            size: file.size
        });
        await NormalHomework.findOneAndUpdate(
            {_id: mongoose.Types.ObjectId(normalHomeworkId)},
            {
                $push: {document: newFile._id}
            },
            {new: true}
        );
        await fs.unlinkSync(file.path);
    }
    catch(err){
        console.log(err);
        return;
    }
};

async function deleteFileWhenUpdate(id, type){
    try{
            await File.updateMany({ ref: mongoose.Types.ObjectId(id) }, { is_delete: true })
    }
    catch(err){
        console.log(err);
    }
}

async function createClassFolder(classes){
    try{
        const folder = await drive.files.create({
            resource: {
                'name': classes.id_class,
                'mimeType': 'application/vnd.google-apps.folder',
            }
        });
        const folderSchema = new FolderClass({
            id_folder: folder.data.id,
            name: folder.data.name,
            class: classes._id
        });
        await folderSchema.save();
    }
    catch(err){
        console.log(err);
        return;
    }
}

async function uploadFileClassNews(userId, classId, classNews, file){
    try{
        const folderClass = await FolderClass.findOne({ class: mongoose.Types.ObjectId(classId), is_delete: false })
        const fileCreateByDrive = await drive.files.create({
            resource: {
                name: file.originalname,
                mimetype: file.mimetype,
                parents: [folderClass.id_folder]
            },
            media: {
                mimeType: file.mimetype,
                body: fs.createReadStream(file.path)
            }
        });
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
        const newFile = await File.create({
            ref: mongoose.Types.ObjectId(classNews._id),
            onModel: "ClassNews",
            create_by: mongoose.Types.ObjectId(userId),
            type: "ClassNews",
            id_file: fileCreateByDrive.data.id,
            name: fileCreateByDrive.data.name,
            mimeType: fileCreateByDrive.data.mimetype,
            parent: mongoose.Types.ObjectId(folderClass._id),
            viewLink: linkFileDirve.data.webViewLink,
            downloadLink: linkFileDirve.data.webContentLink,
            size: file.size
        });
        await ClassNews.findOneAndUpdate(
            {_id: mongoose.Types.ObjectId(classNews._id)},
            {
                $push: {document: newFile._id}
            },
            {new: true}
        );
        await fs.unlinkSync(file.path);
    }
    catch(err){
        console.log(err);
        return;
    }
}


async function uploadFileSubmit(classId, userId, file, submitId){
    try{
        const folderClass = await FolderClass.findOne({ class: mongoose.Types.ObjectId(classId), is_delete: false })
        const fileCreateByDrive = await drive.files.create({
            resource: {
                name: file.originalname,
                mimetype: file.mimetype,
                parents: [folderClass.id_folder]
            },
            media: {
                mimeType: file.mimetype,
                body: fs.createReadStream(file.path)
            }
        });
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
        const newFile = await File.create({
            ref: mongoose.Types.ObjectId(submitId),
            onModel: "SubmitHomework",
            create_by: mongoose.Types.ObjectId(userId),
            type: "SubmitHomework",
            id_file: fileCreateByDrive.data.id,
            name: fileCreateByDrive.data.name,
            mimeType: fileCreateByDrive.data.mimetype,
            parent: mongoose.Types.ObjectId(folderClass._id),
            viewLink: linkFileDirve.data.webViewLink,
            downloadLink: linkFileDirve.data.webContentLink,
            size: file.size
        });
        await SubmitHomework.findOneAndUpdate(
            {_id: mongoose.Types.ObjectId(submitId)},
            {
                $push: {document: newFile._id}
            },
            {new: true}
        );
        await fs.unlinkSync(file.path);
    }
    catch(err){
        console.log(err);
        return;
    }
}

async function uploadFileBlog(userId, file, blogId){
    try{
        //Upload file lên drive
        const fileCreateByDrive = await drive.files.create({
            resource: {
                name: file.originalname,
                mimetype: file.mimetype
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

        const newFile = await File.create({
            ref: mongoose.Types.ObjectId(blogId),
            onModel: "Blog",
            type: "Blog",
            create_by: mongoose.Types.ObjectId(userId),
            id_file: fileCreateByDrive.data.id,
            name: fileCreateByDrive.data.name,
            mimeType: fileCreateByDrive.data.mimetype,
            viewLink: linkFileDirve.data.webViewLink,
            downloadLink: linkFileDirve.data.webContentLink,
            size: file.size
        });
        await Blog.findByIdAndUpdate(blogId, 
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

module.exports = {
    createClassFolder,
    uploadFileCreateHomeWork,
    deleteFileWhenUpdate,
    uploadFileClassNews,
    uploadFileSubmit,
    uploadFileBlog
}