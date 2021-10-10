const mongoose = require('mongoose');
const User = require('../../models/User');
const Class =require('../../models/Class');
const ClassMember = require('../../models/ClassMember');
const ClassNews = require('../../models/ClassNews');
const Comment = require('../../models/Comment');
const ClassNewsAssign = require('../../models/ClassNewsAssign');
const File = require('../../models/File');
const ClassRole = require('../../models/ClassRole');
const moment = require('moment');
const FolerServices = require('../../services/file_and_folder/index');
const NotificationController = require('./NotificationController');
const { parseTimeFormMongo, changeTimeInDBToISOString } = require('../../../helpers/parse_date');
class ClassNewsController{
    async create(req, res){
        try{
            let reqStudent = await JSON.parse(req.body.emails);
            const now = moment().toDate().toString();
            const user = await User.findOne({ email : res.locals.email});
            const classs = await Class.findOne({ id_class: Number(req.body.id_class), is_delete: false});
            const classRole = await ClassRole.findOne({id_class_role : 2})
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
                // nếu có file
                if(req.files){
                    if(req.files.length> 0){
                        for(let i = 0; i < req.files.length; i++){
                            await FolerServices.uploadFileClassNews(user._id, classs._id, classNews,req.files[i]);
                        }
                    }
                }
                const listIdStudent = [];
                const listStudent = await ClassMember.find({ is_delete: false, class: mongoose.Types.ObjectId(classs._id), role: mongoose.Types.ObjectId(classRole._id) });
                if(listStudent.length > 0){
                    for(let i = 0; i < listStudent.length; i++){
                        // await ClassNewsAssign.create({ 
                        //     user: mongoose.Types.ObjectId(listStudent[i].user),
                        //     class: mongoose.Types.ObjectId(classs._id),
                        //     class_news: mongoose.Types.ObjectId(classNews._id)
                        // })     
                        listIdStudent.push(listStudent[i].user)
                    }
                }
                await NotificationController.newsNotify(classNews._id, user._id, listIdStudent, 1)
                const data = await ClassNews.findById(classNews._id)
                    .populate('user', '-password')
                    .populate('class')
                    .populate("document", "name viewLink downloadLink size id_files");
                const result = JSON.parse(JSON.stringify(data));
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
            const now = moment().toDate().toString();
            const newsWantDelete = await ClassNews.findOne({ id_class_news: Number(req.body.id_class_news), is_delete: false })
                .populate('user','-password')
                .populate('class')
            if(newsWantDelete.user.email == res.locals.email){
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
            let reqAttachments = JSON.parse(req.body.attachments);
            const now = moment().toDate().toString();
            const classRole = await ClassRole.findOne({id_class_role : 2})
            const newsWantUpdate = await ClassNews.findOne({ id_class_news: Number(req.body.id_class_news), is_delete: false })
                .populate('user','-password')
            if(newsWantUpdate.user.email == res.locals.email){
                if(reqAttachments.length > 0){
                    let newDocument = [];
                    let length = reqAttachments.length
                    // Xóa tất cả file trong news đi
                    // làm document rỗng
                    // Lặp qua reqAttachment nếu có trong đó thì update trở lại thành false push lại database
                    //await FolerServices.deleteFileWhenUpdate(newsWantUpdate._id, 1);
                    for(let i = 0; i < length; i++){
                        let file = await File.findOneAndUpdate({ id_files: reqAttachments[i].id_files }, { is_delete: false }, { new: true });
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
                    await FolerServices.deleteFileWhenUpdate(newsWantUpdate._id, 1);
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
                            await FolerServices.uploadFileClassNews(newsWantUpdate.user._id, newsWantUpdate.class, newsWantUpdate,req.files[i]);
                        }
                    }
                }
                const listIdStudent = [];
                const listStudent = await ClassMember.find({ is_delete: false, class: mongoose.Types.ObjectId(newsWantUpdate.class), role: mongoose.Types.ObjectId(classRole._id) });
                if(listStudent.length > 0){
                    for(let i = 0; i < listStudent.length; i++){
                        //await NotificationController.createClassNewsNotify(newsWantUpdate.class, newsWantUpdate._id, newsWantUpdate.user._id, listStudent[i].user, 2)
                        listIdStudent.push(listStudent[i].user)
                    }
                }
                await NotificationController.newsNotify(req.body.id_class_news, newsWantUpdate.user._id, listIdStudent, 2)
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
            const news =  await ClassNews.findOne({ id_class_news: Number(req.body.id_class_news), is_delete: false })
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
            // let arrayStudentAssgined = await ClassNewsAssign.find({ class: mongoose.Types.ObjectId(news.class), class_news: mongoose.Types.ObjectId(news._id), is_delete: false })
            //                                     .populate('user', '-__v, -password');
            //     let arrayStudentAssginedEmail = [];
            //     arrayStudentAssgined.forEach(student => {
            //         arrayStudentAssginedEmail.push(student.user.email);
            //     });
            let data = JSON.parse(JSON.stringify(news));
            data['comments'] = arrayComment;
            //data['student_assgined'] = arrayStudentAssginedEmail;
            return res.json({
                success: true,
                message: "get detail notification successfully!",
                data: data,
                res_code: 200,
                res_status: "GET_SUCCESSFULLY"
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

    async getAllNewsOfUser(req, res){
        try{
            let list  = [];
            const user = await User.findOne({email: res.locals.email})
            let user_id = user._id;
            // lấy news đc tạo
        }
        catch(err){
            console.log(err);
            res.json({
                success: false,
                message: 'Server error. Please try again.',
                error: err,
                res_code: 500,
                res_status: "SERVER_ERROR"
            });
            return
        }
    }
}

module.exports = new ClassNewsController;