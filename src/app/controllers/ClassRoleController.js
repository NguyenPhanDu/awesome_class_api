const ClassRole = require('../models/ClassRole');

class ClassRoleController{
    show(req, res){
        ClassRole.find({})
            .then(classRole => {
                res.json(classRole)
            })
            .catch(err => {
                res.json({
                    err: err.message
                })
            })
    };
    store(req, res){
        const classRole = new ClassRole({
            name: req.body.name
        });
        classRole.save()
            .then(classRole => {
                res.json({
                    data: classRole
                })
            })
            .catch(err => {
                console.log(err);
            })
    }
};

module.exports = new ClassRoleController