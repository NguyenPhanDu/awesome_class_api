const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const ClassMember = require('../../models/ClassMember');
const ClassNews = require('../../models/ClassNews');
const Comment = require('../../models/Comment');
const ClassNewsFolerSev = require('../../services/file_and_folder/class_news');
const ClassNewsAssign = require('../../models/ClassNewsAssign');
const File = require('../../models/File');
const ClassRole = require('../../models/ClassRole');
const moment = require('moment');

class ClassNewsController{
    async create(req, res){
        try{
            let reqStudent = await JSON.parse(req.body.emails);
            const now = moment().toDate().toDateString();
            const user = await User.findOne({ email : res.locals.email});
            const classs = await Class.findOne({ id_class: Number(req.body.id_class), is_delete: false});
            const classRole = await ClassRole.findOne({id_class_role : 2})
            let classRoleStudentId = classRole._id
            const classMember = await ClassMember.findOne({ user :  mongoose.Types.ObjectId(user._id), class : mongoose.Types.ObjectId(classs._id)})
                                        .populate('role');
            if(classMember.role.id_class_role == 1){
                // Tạo mới news chưa có file
                const classNews = await ClassNews.create({
                    user: mongoose.Types.ObjectId(user._id),
                    class: mongoose.Types.ObjectId(classs._id),
                    title: req.body.title,
                    description: req.body.description,
                    create_at: now,
                    update_at: now
                });
                // tạo thư mục của news này trên google, cơ sở dữ liệu
                await ClassNewsFolerSev.createFolerClassNews(user._id, classs._id, classNews)
                // nếu có file
                if(req.files){
                    if(req.files.length> 0){
                        for(let i = 0; i < req.files.length; i++){
                            await ClassNewsFolerSev.uploadFileNews(user._id, classs._id, classNews,req.files[i]);
                        }
                    }
                }
                // Chỉ định học sinh
                if(reqStudent.length > 0){
                    let arrayUserId = [];
                    let arrayLength = reqStudent.length;
                    for(let i = 0; i < arrayLength; i++){
                        let user =  await User.findOne({email: reqStudent[i] })
                        arrayUserId.push(user._id)
                    }
                    let arrUserIdLength  = arrayUserId.length
                    for(let i = 0; i< arrUserIdLength; i++){
                        await ClassNewsAssign.create({
                            user: mongoose.Types.ObjectId(arrayUserId[i]),
                            class: mongoose.Types.ObjectId(classs._id),
                            class_news: mongoose.Types.ObjectId(classNews._id),
                        })
                    }
                }
                else{
                    let arrStudentInClass = await ClassMember.find({ class: mongoose.Types.ObjectId(classs._id), role: mongoose.Types.ObjectId(classRoleStudentId), is_delete: false })
                    if(arrStudentInClass.length > 0){
                        let arrLength = arrStudentInClass.length
                        for(let i =0; i< arrLength; i++){
                            await ClassNewsAssign.create({
                                user: mongoose.Types.ObjectId(arrStudentInClass[i].user),
                                class: mongoose.Types.ObjectId(classs._id),
                                class_news: mongoose.Types.ObjectId(classNews._id),
                            })
                        };
                    }
                };
                let arrayStudentAssgined = await ClassNewsAssign.find({ class: mongoose.Types.ObjectId(classs._id), class_news: mongoose.Types.ObjectId(classNews._id), is_delete: false })
                                                .populate('user', '-__v, -password');
                let arrayStudentAssginedEmail = [];
                arrayStudentAssgined.forEach(student => {
                    arrayStudentAssginedEmail.push(student.user.email);
                });
                const data = await ClassNews.findById(classNews._id)
                    .populate('user', '-password')
                    .populate('class')
                    .populate("document", "name viewLink downloadLink size id_files");
                const result = JSON.parse(JSON.stringify(data));
                result['student_assgined'] = arrayStudentAssginedEmail;
                return res.json({
                    success: true,
                    message: "Create news successfully!",
                    data: result,
                    res_code: 200,
                    res_status: "CREATE_SUCCESSFULLY"
                }) 
            }
            else{
                return res.json({
                    success: false,
                    message: "No access",
                    res_code: 403,
                    res_status: "NO_ACCESS"
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
    };
    // req.body : id_class_news
    async delete(req, res){
        try{
            const now = moment().toDate().toDateString();
            const newsWantDelete = await ClassNews.findOne({ id_class_news: Number(req.body.id_class_news), is_delete: false })
                .populate('user','-password')
                .populate('class')
            if(newsWantDelete.user.email == res.locals.email){
                await ClassNewsFolerSev.deleteFolderClassNews(newsWantDelete.class._id, newsWantDelete)
                await ClassNews.findOneAndUpdate(
                    { id_class_news: Number(req.body.id_class_news), is_delete: false },
                    { is_delete: true, update_at: now },
                    { new : true }
                );
                await ClassNewsAssign.updateMany(
                    {
                        class_news : mongoose.Types.ObjectId(newsWantDelete._id),
                        is_delete : false
                    },
                    {
                        is_delete: true,
                    }
                )
                return res.json({
                    success: true,
                    message: "Delete notification successfully!",
                    res_code: 200,
                    res_status: "DELETE_SUCCESSFULLY"
                }) 
            }
            else{
                return res.json({
                    success: false,
                    message: "No access",
                    res_code: 403,
                    res_status: "NO_ACCESS"
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
    };
    // req.body : title, description, id_class_news
    async update(req, res){
        try{
            let reqStudent = await JSON.parse(req.body.emails);
            let reqAttachments = JSON.parse(req.body.attachments);
            const now = moment().toDate().toDateString();
            const newsWantUpdate = await ClassNews.findOne({ id_class_news: Number(req.body.id_class_news), is_delete: false })
                .populate('user','-password')
            if(newsWantUpdate.user.email == res.locals.email){
                await ClassNewsAssign.updateMany(
                    {
                        is_delete: false,
                        class: mongoose.Types.ObjectId(newsWantUpdate.class),
                        class_news : mongoose.Types.ObjectId(newsWantUpdate._id)
                    },
                    {
                        is_delete : true
                    }
                )
                if(reqStudent.length > 0 ){
                    let arrLength = reqStudent.length
                    for(let i = 0; i<arrLength;i++ ){
                        let ddd = await User.findOne({email: reqStudent[i]})
                        let userIds = ddd._id;
                        let a = await ClassNewsAssign.findOne({
                            class: mongoose.Types.ObjectId(newsWantUpdate.class),
                            class_news : mongoose.Types.ObjectId(newsWantUpdate._id),
                            user: mongoose.Types.ObjectId(userIds)
                        });
                        if(a){
                            await HomeworkAssign.findByIdAndUpdate(a._id, { is_delete : false });
                        }
                        else{
                            await ClassNewsAssign.create({
                                user: mongoose.Types.ObjectId(userIds),
                                class: mongoose.Types.ObjectId(newsWantUpdate.class),
                                class_news : mongoose.Types.ObjectId(newsWantUpdate._id),
                            }) 
                        }
                    }
                }
                else{
                    let arrLength = reqStudent.length
                    for(let i = 0; i<arrLength;i++ ){
                        let ddd = await User.findOne({email: reqStudent[i]})
                        let userIds = ddd._id;
                        let a = await ClassNewsAssign.findOne({
                            class: mongoose.Types.ObjectId(newsWantUpdate.class),
                            class_news : mongoose.Types.ObjectId(newsWantUpdate._id),
                            user: mongoose.Types.ObjectId(userIds)
                        });
                        if(a){
                            await HomeworkAssign.findByIdAndUpdate(a._id, { is_delete : false });
                        }
                        else{
                            await ClassNewsAssign.create({
                                user: mongoose.Types.ObjectId(userIds),
                                class: mongoose.Types.ObjectId(newsWantUpdate.class),
                                class_news : mongoose.Types.ObjectId(newsWantUpdate._id),
                            })  
                        }
                    }
                }
                if(reqAttachments.length > 0){
                    let newDocument = [];
                    let length = reqAttachments.length
                    for(let i = 0; i < length; i++){
                        let file = await File.findOne({ id_files: reqAttachments[i].id_files, is_delete: false });
                        if(file){
                            newDocument.push(file._id);
                        } 
                    }
                    await ClassNews.findOneAndUpdate(
                        {_id: mongoose.Types.ObjectId(newsWantUpdate._id)},
                        {
                            document: newDocument
                        },
                        {new: true}
                    );
                }
                else{
                    await ClassNews.findOneAndUpdate(
                        {_id: mongoose.Types.ObjectId(newsWantUpdate._id)},
                        {
                            document: []
                        },
                        {new: true}
                    );
                }
                if(req.files){
                    if(req.files.length> 0){
                        for(let i = 0; i < req.files.length; i++){
                            await ClassNewsFolerSev.uploadFileNews(newsWantUpdate.user._id, newsWantUpdate.classs, newsWantUpdate,req.files[i]);
                        }
                    }
                }
                const newsUpdate = await ClassNews.findOneAndUpdate(
                    { id_class_news: Number(req.body.id_class_news), is_delete: false },
                    {  
                        title: req.body.title,
                        description: req.body.description,
                        update_at: now
                    },
                    { new : true }
                )
                .populate('user', '-password')
                .populate("document", "name viewLink downloadLink size id_files");
                
                const data = JSON.parse(JSON.stringify(newsUpdate));

                let arrayStudentAssgined = await ClassNewsAssign.find({ class: mongoose.Types.ObjectId(newsUpdate.class), class_news: mongoose.Types.ObjectId(newsUpdate._id), is_delete: false })
                                                .populate('user', '-__v, -password');
                let arrayStudentAssginedEmail = [];
                arrayStudentAssgined.forEach(student => {
                    arrayStudentAssginedEmail.push(student.user.email);
                });
                data['student_assgined'] = arrayStudentAssginedEmail;
                return res.json({
                    success: true,
                    message: "Create notification successfully!",
                    data: data,
                    res_code: 200,
                    res_status: "DELETE_SUCCESSFULLY"
                }) 
            }
            else{
                return res.json({
                    success: false,
                    message: "No access",
                    res_code: 403,
                    res_status: "NO_ACCESS"
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
    };
    // req.body : id_class_news
    async getDetailNews(req, res){
        try{
            const news =  await ClassNews.findOne({ id_class_news: Number(req.body.id_class_news) })
            .populate('user', '-password')
            .populate("document", "name viewLink downloadLink size id_files");
            const arrayComment = await Comment.find(
                { 
                    is_delete: false,
                    onModel: 'ClassNews',
                    ref: mongoose.Types.ObjectId(news._id)
                }
            )
            .populate('user', '-password');
            let arrayStudentAssgined = await ClassNewsAssign.find({ class: mongoose.Types.ObjectId(news.class), class_news: mongoose.Types.ObjectId(news._id), is_delete: false })
                                                .populate('user', '-__v, -password');
                let arrayStudentAssginedEmail = [];
                arrayStudentAssgined.forEach(student => {
                    arrayStudentAssginedEmail.push(student.user.email);
                });
            let data = JSON.parse(JSON.stringify(news));
            data['comments'] = arrayComment;
            data['student_assgined'] = arrayStudentAssginedEmail;
            return res.json({
                success: true,
                message: "get detail notification successfully!",
                data: data,
                res_code: 200,
                res_status: "DELETE_SUCCESSFULLY"
            }) 
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
    };
}

module.exports = new ClassNewsController;