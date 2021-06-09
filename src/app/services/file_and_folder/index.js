const mongoose = require('mongoose');
const drive = require('../../../config/google_drive/index');
const Folder = require('../../models/Folder');
const FolerUser = require('../../models/FolderUser');
const FolderClass = require('../../models/FolderClass');
const FolderHomework = require('../../models/FolderHomework');
const ClassHomework = require('../../models/ClassHomework');

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
}

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
        let path = folderUser.folder.path+folerDrive.data.name.replace(/\s+/g, '')+'/';
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
}

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
        let path = parentFolder.folder.path+folerDrive.data.name.replace(/\s+/g, '')+'/';
        const folderchema = new Folder({
            id_folder: folerDrive.data.id,
            name: folerDrive.data.name,
            path: path,
            level: 3,
            type: 0,
            parent: parentFolder.folder._id
        });
        const newFolderHomework = await folderchema.save();
        const folderHomework = await FolderHomework.create({
            create_by: mongoose.Types.ObjectId(userId),
            class: mongoose.Types.ObjectId(classId),
            class_homework: mongoose.Types.ObjectId(classHomework._id),
            folder: mongoose.Types.ObjectId(newFolderHomework._id)
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
            folder: mongoose.Types.ObjectId(newFolerTeacher._id)
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
            folder: mongoose.Types.ObjectId(newFolerStudent._id)
        })
    }
    catch(err){
        console.log(err);
        return
    }
}



module.exports = {
    createUserFolder,
    createClassFolder,
    createFolderHomework
}