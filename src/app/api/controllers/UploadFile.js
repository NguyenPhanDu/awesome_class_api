const drive = require('../../../config/google_drive/index');
const User = require('../../models/User');
class upLoadFile {
    async upLoadFile(req, res){
        let reqStudent = await JSON.parse(req.body.emails);
        const reqCategory = await JSON.parse(req.body.category);
        const reqTotalScore = await JSON.parse(req.body.total_scores);
        if(req.body.deadline == 'null'){
            req.body.deadline = null;
        }
        let blogalHomework
        let homeworkId;
        let classRoleStudentId;
        await ClassRole.findOne({id_class_role : 2})
            .then(classRole => {
                classRoleStudentId = classRole._id;
            })
        let userId;
        await User.findOne({email: res.locals.email})
            .then(user => {
                userId = user._id;
            })
        let classId;
        await Class.findOne({id_class : Number(req.body.id_class)})
            .then(classs => {
                classId = classs._id
            });
        let parentFolder;
        await Directory.findOne({refId: classId})
            .then(result=> {
                parentFolder = result;
            })
        //Vai trò của user trong class
        let userRole;
        await ClassMember.findOne({ user :  mongoose.Types.ObjectId(userId), class : mongoose.Types.ObjectId(classId)})
                .populate('role')
                .then(classMember => {
                    userRole = classMember.role.id_class_role;
                });
        if(userRole == 1){
            let homeWorkTypeId;
            await HomeworkType.findOne({id_homework_type: 1})
                    .then(homeWorkType => {
                        homeWorkTypeId = homeWorkType._id
                    })
            if(reqCategory == null){
                const newHomework = NormalHomework({
                    title: req.body.title,
                    description: req.body.description,
                    start_date: req.body.start_date,
                    deadline: req.body.deadline,
                    total_scores: reqTotalScore,
                    homework_type: mongoose.Types.ObjectId(homeWorkTypeId),
                    create_by: mongoose.Types.ObjectId(userId)
                });
                await newHomework.save()
                    .then(async homework => {
                        homeworkId = homework._id
                        await ClassHomework.create({
                            class: mongoose.Types.ObjectId(classId),
                            homework: mongoose.Types.ObjectId(homework._id),
                            onModel: 'NormalHomework'
                        })
                        .then(async result => {
                            blogalHomework = result;
                            await googleDriveCrud.createHomeworkFolder(homework.title,result._id,parentFolder);
                        })
                        .catch(err => {
                            console.log(err);
                            return res.json({
                                success: false,
                                message: 'Server error. Please try again. create class homework failed',
                                error: err,
                                res_code: 500,
                                res_status: "SERVER_ERROR"
                            });
                        });
                        // Trường hợp chọn học sinh chỉ định
                        if(reqStudent.length > 0){
                            let arrayUserId = [];
                            for(let i = 0; i < reqStudent.length; i++){
                                await User.findOne({email: reqStudent[i] })
                                    .then(result => {
                                        arrayUserId.push(result.user)
                                    })
                            }

                            for(let i = 0; i< arrayUserId.length; i++){
                                HomeworkAssign.create({
                                    user: mongoose.Types.ObjectId(arrayUserId[i]),
                                    class: mongoose.Types.ObjectId(classId),
                                    homework: mongoose.Types.ObjectId(homework._id),
                                    onModel: 'NormalHomework'
                                })
                            }
                            return blogalHomework;
                        }
                        // Trường hợp không chỉ định học sinh
                        else{
                            await ClassMember.find({ class: mongoose.Types.ObjectId(classId), role: mongoose.Types.ObjectId(classRoleStudentId) })
                            .then(classMember => {
                                for(let i =0; i< classMember.length; i++){
                                    HomeworkAssign.create({
                                        user: mongoose.Types.ObjectId(classMember[i].user),
                                        class: mongoose.Types.ObjectId(classId),
                                        homework: mongoose.Types.ObjectId(homework._id),
                                        onModel: 'NormalHomework'
                                    })
                                };
                            })
                            .catch(err => {
                                return res.json({
                                    success: false,
                                    message: 'Server error. Please try again. create homework assign failed',
                                    error: err,
                                    res_code: 500,
                                    res_status: "SERVER_ERROR"
                                });
                            });
                            return blogalHomework;
                        }
                        
                    })
                    .then(async blogalHomework => {
                        console.log('blogalHomework', blogalHomework);
                        if(req.files){
                            await googleDriveCrud.uploadFile(req.files, blogalHomework)
                        }
                    })
                    .then((blogalHomework)=>{
                        NormalHomework.findById(homeworkId)
                            .populate("homework_type", "-_id -__v")
                            .populate("create_by", "-_id -__v -password")
                            .populate("document", "name viewLink downloadLink size")
                            .then(result => {
                                return res.json({
                                    success: true,
                                    message: "Create homework successfull!",
                                    data: result,
                                    res_code: 200,
                                    res_status: "CREATE_SUCCESSFULLY"
                                })
                            })
                    })
                    .catch(err => {
                        return res.json({
                            success: false,
                            message: 'Server error. Please try again. create homework failed',
                            error: err,
                            res_code: 500,
                            res_status: "SERVER_ERROR"
                        });
                    });
            }
            else{
                let categoryId;
                await HomeworkCategory.findOne({is_delete: false, id_homework_category: reqCategory.id_homework_category})
                    .then(async category => {
                        if(!category){
                            await HomeworkCategory.create({
                                title: reqCategory.title,
                                user: mongoose.Types.ObjectId(userId),
                                class: mongoose.Types.ObjectId(classId)
                            })
                            .then(result => {
                                categoryId = result._id;
                            })
                            .catch(err => {
                                console.log(err);
                            })
                            return categoryId;
                        }
                        return category._id;
                    })
                    .then(async result => {
                        const newHomework = NormalHomework({
                            title: req.body.title,
                            description: req.body.description,
                            start_date: req.body.start_date,
                            deadline: req.body.deadline,
                            total_scores: reqTotalScore,
                            homework_type: mongoose.Types.ObjectId(homeWorkTypeId),
                            create_by: mongoose.Types.ObjectId(userId),
                            homework_category: mongoose.Types.ObjectId(result)
                        });
                        await newHomework.save()
                            .then(async homework => {
                                await googleDriveCrud.createHomeworkFolder(homework.title,homework._id,parentFolder)
                                blogalHomework = homework;
                                homeworkId = homework._id
                                await ClassHomework.create({
                                    class: mongoose.Types.ObjectId(classId),
                                    homework: mongoose.Types.ObjectId(homework._id),
                                    onModel: 'NormalHomework'
                                })
                                .then(result => {
                                })
                                .catch(err => {
                                    return res.json({
                                        success: false,
                                        message: 'Server error. Please try again. create class homework failed',
                                        error: err,
                                        res_code: 500,
                                        res_status: "SERVER_ERROR"
                                    });
                                });
                                if(reqStudent.length > 0){
                                    let arrayUserId = [];
                                    for(let i = 0; i < reqStudent.length; i++){
                                        await User.findOne({email: reqStudent[i] })
                                            .then(result => {
                                                arrayUserId.push(result.user)
                                            })
                                    }
        
                                    for(let i = 0; i< arrayUserId.length; i++){
                                        HomeworkAssign.create({
                                            user: mongoose.Types.ObjectId(arrayUserId[i]),
                                            class: mongoose.Types.ObjectId(classId),
                                            homework: mongoose.Types.ObjectId(homework._id),
                                            onModel: 'NormalHomework'
                                        })
                                    }
                                    return blogalHomework;
                                }
                                else{
                                    await ClassMember.find({ class: mongoose.Types.ObjectId(classId), role: mongoose.Types.ObjectId(classRoleStudentId) })
                                    .then(classMember => {
                                        for(let i =0; i< classMember.length; i++){
                                            HomeworkAssign.create({
                                                user: mongoose.Types.ObjectId(classMember[i].user),
                                                class: mongoose.Types.ObjectId(classId),
                                                homework: mongoose.Types.ObjectId(homework._id),
                                                onModel: 'NormalHomework'
                                            })
                                        };
                                    })
                                    .catch(err => {
                                        return res.json({
                                            success: false,
                                            message: 'Server error. Please try again. create homework assign failed',
                                            error: err,
                                            res_code: 500,
                                            res_status: "SERVER_ERROR"
                                        });
                                    });
                                    return blogalHomework;
                                }   
                            })
                            .then(async blogalHomework => {
                                await googleDriveCrud.uploadFile(req.files, blogalHomework)
                            })
                            .then((homework)=>{
                                NormalHomework.findById(homeworkId)
                                    .populate("homework_type", "-_id -__v")
                                    .populate("create_by", "-_id -__v -password")
                                    .populate("homework_category", "-_id -__v")
                                    .populate("document", "name viewLink downloadLink size")
                                    .then(result => {
                                        return res.json({
                                            success: true,
                                            message: "Create homework successfull!",
                                            data: result,
                                            res_code: 200,
                                            res_status: "CREATE_SUCCESSFULLY"
                                        })
                                    })
                            })
                            .catch(err => {
                                return res.json({
                                    success: false,
                                    message: 'Server error. Please try again. create homework failed',
                                    error: err,
                                    res_code: 500,
                                    res_status: "SERVER_ERROR"
                                });
                            });
                    })
            }
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

    async sort(req, res){
        try{
            let perPage = 4;
            let page = req.params.page || 1;

            const users = await User.find()
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort({ createdAt : -1 });

            // const count = await User.countDocuments();
            // let pages = Math.ceil(count / perPage);
            // const array = []
            // let start = (page - 1) * perPage
            // let end = page * perPage
            // const items = array.slice(start, end);
            const data = {
                users: users,
            }

            res.json(data);
        }
        catch(err){
            console.log(err)
        }
    }

}

module.exports = new upLoadFile;
