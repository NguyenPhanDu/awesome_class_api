const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const SubmitHomeworkSchema = Schema(
    {
        user: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        class_homework: {
            type: Schema.Types.ObjectId,
            ref: 'ClassHomework'
        },
        content: {
            type: String,
            default: '',
        },
        assignment: {
            type: Schema.Types.ObjectId,
            ref: 'HomeworkAssign'
        },
        submit_at: {
            type: String
        },
        document: [
            {
                type: Schema.Types.ObjectId,
                ref: 'File',
            }
        ],
        is_delete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps :true,
        collection: 'submit_homeworks'
    }
)

SubmitHomeworkSchema.plugin(AutoIncrement,{inc_field: 'id_submit_homework'});
module.exports = mongoose.model('SubmitHomework', SubmitHomeworkSchema);