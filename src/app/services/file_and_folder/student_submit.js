const mongoose = require('mongoose');
const drive = require('../../../config/google_drive/index');
const Folder = require('../../models/Folder');
const FolderHomework = require('../../models/FolderHomework');
const File = require('../../models/File');
const SubmitHomework = require('../../models/SubmitHomework');
const fs = require('fs');

async function createStudentSubmit(classId, classHomework, user){
    try{
        const folderStudent = await FolderHomework.findOne({
            class: mongoose.Types.ObjectId(classId),
            class_homework: mongoose.Types.ObjectId(classHomework._id),
            level: 4,
            type: 1,
        })
        .populate('folder');
        const folderStudentss = await FolderHomework.findOne({
            create_by: mongoose.Types.ObjectId(user._id),
            class: mongoose.Types.ObjectId(classId),
            class_homework: mongoose.Types.ObjectId(classHomework._id),
            level: 5,
            type: 1,
        })
        .populate('folder');
        if(folderStudentss){
            await FolderHomework.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(folderStudentss._id) },
                { is_delete: false }
            )
            await Folder.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(folderStudentss.folder) },
                { is_delete: false }
            )
        }
        else{
            const folerStudentSubmitDrive = response = await drive.files.create({
                resource: {
                    'name': user.id_user,
                    'mimeType': 'application/vnd.google-apps.folder',
                    parents: [folderStudent.folder.id_folder]
                }
            });
            let pathStudentSubmitFolder = folderStudent.folder.path+folerStudentSubmitDrive.data.name+'/';
            const newFolerStudent = await Folder.create({
                id_folder: folerStudentSubmitDrive.data.id,
                name: folerStudentSubmitDrive.data.name,
                path: pathStudentSubmitFolder,
                level: 5,
                type: 1,
                parent: folderStudent.folder._id
            });
            await FolderHomework.create({
                create_by: mongoose.Types.ObjectId(user._id),
                class: mongoose.Types.ObjectId(classId),
                class_homework: mongoose.Types.ObjectId(classHomework._id),
                folder: mongoose.Types.ObjectId(newFolerStudent._id),
                level: 5,
                type: 1
            })
        }
    }
    catch(err){
        console.log(err);
        return;
    }
}

async function uploadFileSubmit(classId, classHomework, user, file, submitId){
    try{
        const folderStudentSubmit = await FolderHomework.findOne(
            {
                create_by: mongoose.Types.ObjectId(user._id),
                class: mongoose.Types.ObjectId(classId),
                class_homework: mongoose.Types.ObjectId(classHomework._id),
                level: 5,
                type: 1,
                is_delete: false,
            }
        ).populate('folder');
        
        const fileCreateByDrive = await drive.files.create({
            resource: {
                name: file.originalname,
                mimetype: file.mimetype,
                parents: [folderStudentSubmit.folder.id_folder]
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
        let pathFile= folderStudentSubmit.folder.path+fileCreateByDrive.data.name.replace(/\s+/g, '')+'/';
        const newFile = await File.create({
            class_homework: mongoose.Types.ObjectId(classHomework._id),
            class: mongoose.Types.ObjectId(classId),
            create_by: mongoose.Types.ObjectId(user._id),
            type: 1,
            id_file: fileCreateByDrive.data.id,
            name: fileCreateByDrive.data.name,
            mimeType: fileCreateByDrive.data.mimetype,
            parent: mongoose.Types.ObjectId(folderStudentSubmit.folder._id),
            path: pathFile,
            level: 6,
            viewLink: linkFileDirve.data.webViewLink,
            downloadLink: linkFileDirve.data.webContentLink,
            size: file.size
        });
        await SubmitHomework.findByIdAndUpdate(submitId, 
            {
                $push: {document: newFile._id}
            }
        );
        await fs.unlinkSync(file.path);
    }
    catch(err){
        console.log(err);
        return
    }
}


module.exports = {
    createStudentSubmit,
    uploadFileSubmit
}