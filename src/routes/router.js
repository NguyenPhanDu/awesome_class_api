const userTypeRouter = require('./modules/user_type');
const authRouter = require('./modules/auth');
const activeRouter = require('./modules/active_mail');
const forgotPasswordRouter = require('./modules/forgot_password');
const userProfileRouter = require('./modules/user_profile');
const AuthController = require('../app/api/controllers/AuthAPIController');
const ClassRouter = require('./modules/class');
const ClassMemberRouter = require('./modules/class_member');
const ChangePasswordRouter = require('./modules/change_password');
const HomeworkRouter = require('./modules/homework');
const ClassHomeworkRouter = require('./modules/class_homework');
const HomeworkAssignRouter = require('./modules/homework_assign');
const HomeworkCategoryRouter = require('./modules/homework_category');
const ClassNewsRouter = require('./modules/class_news');
const CommentRouter = require('./modules/comment');
const NewFeedRouter = require('./modules/new_feed');
const NotificationRouter = require('./modules/notification');
const BookMarkRouter = require('./modules/book_mark');
const BlogController = require('./modules/blog');
const FileManageRouter = require('./modules/file_management');


// MVC
const siteRouter = require('./mvc/site');
const AuthMVCRouter = require('./mvc/auth');
const HomeworkType = require('./mvc/homework_type');
const UserRouter = require('./mvc/user');
const NormalUserMVC = require('./mvc/nomarl_user');
const ClassRoleRouter = require('../app/controllers/ClassRoleController')


function route(app){
    // API ROUTER
    app.get('/api/user/:id',AuthController.getUser);
    app.use('/api/user_type',userTypeRouter);
    app.use('/api/auth/',authRouter);
    app.use('/auth/',activeRouter);
    app.use('/api/forgot-password',forgotPasswordRouter);
    app.use('/api/user-profile',userProfileRouter);
    app.use('/api/class/',ClassRouter);
    app.use('/api/change-password', ChangePasswordRouter);
    app.use('/api/class-member/',ClassMemberRouter);
    app.use('/api/homework/', HomeworkRouter);
    app.use('/api/class-homework', ClassHomeworkRouter);
    app.use('/api/homework-assign', HomeworkAssignRouter)
    app.use('/api/homework-category', HomeworkCategoryRouter);
    app.use('/api/class-news',ClassNewsRouter);
    app.use('/api/comment', CommentRouter);
    app.use('/api/newfeed',NewFeedRouter);
    app.use('/api/notification', NotificationRouter);
    app.use('/api/book-mark', BookMarkRouter);
    app.use('/api/blog', BlogController);
    app.use('/api/file-management', FileManageRouter);

    //MVC ROUTER
    app.use('/admin/',siteRouter);
    app.use('/admin/',AuthMVCRouter);
    app.use('/homework-type', HomeworkType);
    app.use('/admin/users/nomarl-users/',NormalUserMVC);

    app.post('/class-role',ClassRoleRouter.store);
}

module.exports = route;