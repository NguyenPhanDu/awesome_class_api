const mongoose = require('mongoose');
const drive = require('../../../config/google_drive/index');
const Folder = require('../../models/Folder');
const FolerUser = require('../../models/FolderUser');
const FolderClass = require('../../models/FolderClass');
const FolderHomework = require('../../models/FolderHomework');
const ClassHomework = require('../../models/ClassHomework');
const File = require('../../models/File');
const NormalHomework = require('../../models/NormalHomework');
const fs = require('fs');

async function createUserFolder(user){
    try{
        const folder = await drive.files.create({
            resource: {
                'name': user.id_user,
                'mimeType': 'application/vnd.google-apps.folder',
            }
        });
        let path = '/'+user.id_user+'/'
        const folderSchema = new Folder({
            id_folder: folder.data.id,
            name: folder.data.name,
            path: path,
            level: 1,
            type: 0
        });
        const newFolder = await folderSchema.save();
        await FolerUser.create({
            user: mongoose.Types.ObjectId(user._id),
            folder: mongoose.Types.ObjectId(newFolder._id)
        });
    }
    catch(err){
        console.log(err);
        return;
    }
};

async function createClassFolder (userId, classs){
    try{
        const folderUser = await FolerUser.findOne({user: mongoose.Types.ObjectId(userId)})
                                    .populate('folder');
        const folerDrive = response = await drive.files.create({
          resource: {
            'name': classs.name,
            'mimeType': 'application/vnd.google-apps.folder',
            parents: [folderUser.folder.id_folder]
          }
        });
        let path = folderUser.folder.path+classs.id_class.replace(/\s+/g, '')+'/';
        const folderSchema = new Folder({
            id_folder: folerDrive.data.id,
            name: folerDrive.data.name,
            path: path,
            level: 2,
            type: 0,
            parent: folderUser.folder._id
        });
        const newFolder = await folderSchema.save();
        await FolderClass.create({
            class: mongoose.Types.ObjectId(classs._id),
            create_by: mongoose.Types.ObjectId(userId),
            folder: mongoose.Types.ObjectId(newFolder._id),
        })
    }
    catch(err){
        console.log(err);
        return;
    }
};

async function createFolderHomework(userId, classId, classHomework){
    try{
        const classHomeworkDatabase = await ClassHomework.findById(classHomework._id).populate('homework');
        const parentFolder = await FolderClass.findOne({ create_by: mongoose.Types.ObjectId(userId), class: mongoose.Types.ObjectId(classId) })
                        .populate('folder');
        // Folder homework
        const folerDrive = response = await drive.files.create({
            resource: {
                'name': classHomeworkDatabase.homework.title,
                'mimeType': 'application/vnd.google-apps.folder',
                parents: [parentFolder.folder.id_folder]
            }
        });
        let path = parentFolder.folder.path+classHomeworkDatabase.id_class_homework+'/';
        const folderchema = new Folder({
            id_folder: folerDrive.data.id,
            name: folerDrive.data.name,
            path: path,
            level: 3,
            type: 0,
            parent: parentFolder.folder._id
        });
        const newFolderHomework = await folderchema.save();
        await FolderHomework.create({
            create_by: mongoose.Types.ObjectId(userId),
            class: mongoose.Types.ObjectId(classId),
            class_homework: mongoose.Types.ObjectId(classHomework._id),
            folder: mongoose.Types.ObjectId(newFolderHomework._id),
            level: 3,
            type: 0
        })
        // Folder Teacher
        const folerTeacherDrive = response = await drive.files.create({
            resource: {
                'name': 'Teacher',
                'mimeType': 'application/vnd.google-apps.folder',
                parents: [folerDrive.data.id]
            }
        });
        let pathTeacherFolder = newFolderHomework.path+folerTeacherDrive.data.name.replace(/\s+/g, '')+'/';
        const newFolerTeacher = await Folder.create({
            id_folder: folerTeacherDrive.data.id,
            name: folerTeacherDrive.data.name,
            path: pathTeacherFolder,
            level: 4,
            type: 0,
            parent: newFolderHomework._id
        });
        await FolderHomework.create({
            create_by: mongoose.Types.ObjectId(userId),
            class: mongoose.Types.ObjectId(classId),
            class_homework: mongoose.Types.ObjectId(classHomework._id),
            folder: mongoose.Types.ObjectId(newFolerTeacher._id),
            level: 4,
            type: 0,
        })

        // Folder Student
        const folerStudentDrive = response = await drive.files.create({
            resource: {
                'name': 'Student',
                'mimeType': 'application/vnd.google-apps.folder',
                parents: [folerDrive.data.id]
            }
        });
        let pathStudentFolder = newFolderHomework.path+folerStudentDrive.data.name.replace(/\s+/g, '')+'/';
        const newFolerStudent = await Folder.create({
            id_folder: folerStudentDrive.data.id,
            name: folerStudentDrive.data.name,
            path: pathStudentFolder,
            level: 4,
            type: 1,
            parent: newFolderHomework._id
        });
        await FolderHomework.create({
            create_by: mongoose.Types.ObjectId(userId),
            class: mongoose.Types.ObjectId(classId),
            class_homework: mongoose.Types.ObjectId(classHomework._id),
            folder: mongoose.Types.ObjectId(newFolerStudent._id),
            level: 4,
            type: 1
        })
    }
    catch(err){
        console.log(err);
        return
    }
};

async function uploadHomeworkTeacherFile(userId, classId, classHomework, file, normalHomeworkId){
    try{
        const folderTeacher = await FolderHomework.findOne({ class: mongoose.Types.ObjectId(classId), class_homework: mongoose.Types.ObjectId(classHomework._id), level: 4, type: 0})
                                                    .populate('folder');
        const fileCreateByDrive = await drive.files.create({
            resource: {
                name: file.originalname,
                mimetype: file.mimetype,
                parents: [folderTeacher.folder.id_folder]
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
        let pathFile= folderTeacher.folder.path+fileCreateByDrive.data.name.replace(/\s+/g, '')+'/';
        const newFile = await File.create({
            class_homework: mongoose.Types.ObjectId(classHomework._id),
            class: mongoose.Types.ObjectId(classId),
            create_by: mongoose.Types.ObjectId(userId),
            type: 3,
            id_file: fileCreateByDrive.data.id,
            name: fileCreateByDrive.data.name,
            mimeType: fileCreateByDrive.data.mimetype,
            parent: mongoose.Types.ObjectId(folderTeacher.folder._id),
            path: pathFile,
            level: 5,
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

async function deleteClassFoler(classId){
    try{
        const folderClass = await FolderClass.findOne({ class: mongoose.Types.ObjectId(classId), is_delete: false })
                                    .populate('folder')
        let path = folderClass.folder.path;
        
        await FolderClass.findOneAndUpdate(
            { class: mongoose.Types.ObjectId(classId), is_delete: false },
            { is_delete: true },
            { new: true }
        )
        const arrFolderClass = await FolderHomework.find({ class: mongoose.Types.ObjectId(classId), is_delete: false })
        if(arrFolderClass.length > 0){
            await FolderHomework.updateMany({ class: mongoose.Types.ObjectId(classId), is_delete: false }, { is_delete: true })
        }

        await Folder.updateMany({path: { $regex: '.*' + path + '.*' }, is_delete: false}, { is_delete: true });
        const arrayFile = await File.find({path: { $regex: '.*' + path + '.*' }, is_delete: false});
        if(arrayFile.length > 0){
            await File.updateMany({path: { $regex: '.*' + path + '.*' }, is_delete: false}, { is_delete: true })
        }      
    }
    catch(err){
        console.log(err);
        return;
    }
}

async function deleteHomeworkFolder(classId, classHomework){
    try{
        const folderHomework = await FolderHomework.findOne(
            {
                class: mongoose.Types.ObjectId(classId),
                class_homework: mongoose.Types.ObjectId(classHomework._id),
                level: 3,
                is_delete: false
            }
        )
        .populate('folder');
        let path = folderHomework.folder.path
        await FolderHomework.updateMany(
            {
                class: mongoose.Types.ObjectId(classId),
                class_homework: mongoose.Types.ObjectId(classHomework._id),
                is_delete: false
            },
            {
                is_delete: true
            }
        );
        const arrayFoler = await Folder.find({path: { $regex: '.*' + path + '.*' }, is_delete: false})
        if(arrayFoler.length> 0){
            await Folder.updateMany({path: { $regex: '.*' + path + '.*' }, is_delete: false}, { is_delete: true });
        }
        const arrayFile = await File.find({path: { $regex: '.*' + path + '.*' }, is_delete: false});
        if(arrayFile.length > 0){
            await File.updateMany({path: { $regex: '.*' + path + '.*' }, is_delete: false}, { is_delete: true })
        }      

    }
    catch(err){
        console.log(err);
        return;
    }
}

module.exports = {
    createUserFolder,
    createClassFolder,
    createFolderHomework,
    uploadHomeworkTeacherFile,
    deleteClassFoler,
    deleteHomeworkFolder
}