const mongoose = require('mongoose');
const drive = require('../../../config/google_drive/index');
const Folder = require('../../models/Folder');
const File = require('../../models/File');
const Blog = require('../../models/Blog');
const fs = require('fs');

// async function uploadfileBlog(userId, file, blogId){
//     try{
//         // tim folder user
//         const folderUser = await FolderUser.findById(userId).populate('folder')
//         //Upload file lên drive
//         const fileCreateByDrive = await drive.files.create({
//             resource: {
//                 name: file.originalname,
//                 mimetype: file.mimetype,
//                 parents: [folderUser.folder.id_folder]
//             },
//             media: {
//                 mimeType: file.mimetype,
//                 body: fs.createReadStream(file.path)
//             }
//         });
//         // Chia sẽ file
//         await drive.permissions.create({
//             fileId: fileCreateByDrive.data.id,
//             requestBody:{
//                 role: 'reader',
//                 type: 'anyone'
//             }
//         });
//         const linkFileDirve = await drive.files.get({
//             fileId: fileCreateByDrive.data.id,
//             fields: 'webViewLink, webContentLink'
//         });

//         let pathFile= folderUser.folder.path+fileCreateByDrive.data.name.replace(/\s+/g, '')+'/';
//         const newFile = await File.create({
//             blog: mongoose.Types.ObjectId(blogId),
//             create_by: mongoose.Types.ObjectId(userId),
//             type: 1,
//             id_file: fileCreateByDrive.data.id,
//             name: fileCreateByDrive.data.name,
//             mimeType: fileCreateByDrive.data.mimetype,
//             parent: mongoose.Types.ObjectId(folderUser.folder._id),
//             path: pathFile,
//             level: 2,
//             viewLink: linkFileDirve.data.webViewLink,
//             downloadLink: linkFileDirve.data.webContentLink,
//             size: file.size
//         });
//         await Blog.findByIdAndUpdate(blogId, 
//             {
//                 $push: {document: newFile._id}
//             }
//         );
//         await fs.unlinkSync(file.path);
//     }
//     catch(err){
//         console.log(err);
//         return;
//     }
// }

module.exports = {
    //uploadfileBlog
}
