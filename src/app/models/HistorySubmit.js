const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const HistorySubmit = Schema(
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
        },
        answers: [
            {
                type: Number
            }
        ],
        id_submit_homework: Number,
    },
    {
        timestamps :true,
        collection: 'history_submit'
    }
)

HistorySubmit.plugin(AutoIncrement,{inc_field: 'id_history_submit'});
module.exports = mongoose.model('HistorySubmit', HistorySubmit);