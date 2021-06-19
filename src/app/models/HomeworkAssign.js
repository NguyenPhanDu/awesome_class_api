const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const HomeworkAssignSchema = Schema(
    {
        user: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        homework : {
            type: Schema.Types.ObjectId,
            require: true,
            refPath: 'onModel'
        },
        onModel: {
            type: String,
            require: true,
            enum: ['NormalHomework', 'QuestionHomework']
        },
        status: {
            type: Number,
            default: 1,
        },
        scores: {
            type: Number,
            default: null
        },
        is_delete: {
            type: Boolean,
            default: false
        },
        is_submit: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps :true,
        collection: 'homework_assigns'
    }
);

HomeworkAssignSchema.plugin(AutoIncrement,{inc_field: 'id_homework_assign'});
module.exports = mongoose.model('HomeworkAssign', HomeworkAssignSchema);