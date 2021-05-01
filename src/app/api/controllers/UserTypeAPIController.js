const UserType = require('../../models/UserType');

class UseTypeController{
    create(req, res){
        const userType = new UserType({
            name: req.body.name
        })
        userType.save()
            .then(userType =>{
                userType = userType.toObject();
                res.status(200).json({
                    success: true,
                    message: 'New user type created successfully',
                    data: userType,
                });
            })
            .catch(error =>{
                console.log(error);
                res.status(500).json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: error.message,
                });
            });
    };
}

module.exports = new UseTypeController;