const Course = require('../models/Course')

class CourseController {
    show(req,res, next){
        Course.findOne({slug: req.params.slug})
         .then(course => {
             course = course.toObject();
             res.render('courses/show',{course})
         })
         .catch(error => next(error))
    }
    create(req,res,next){
        res.render('courses/create')
    }

    //[POST] courses/store
    store(req, res, next){
        const course = new Course(req.body)
        course.save()
            .then(()=> res.redirect('/'))
            .catch(error => next(error))
    }

    edit(req,res,next){
        Course.findById(req.params.id)
            .then(course=> {
                course = course.toObject();
                res.render('courses/edit', {course})
            })
            .catch(error => next(error))
    }
    update(req, res, next){
        Course.updateOne({_id: req.params.id},req.body)
            .then(()=>res.redirect('/me/store/coures/'))
    }
    destroy(req, res, next){
        Course.deleteOne({ _id: req.params.id})
            .then(()=> res.redirect('back'))
            .catch(error => next(error))
    } 
}

module.exports = new CourseController