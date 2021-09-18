const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;
require('./File');
const NormalHomeworkSchema = Schema(
    {
        title: {
            type: String,
            required: ''
        },
        description: {
            type: String,
            default: ''
        },
        deadline: {
            type: String,
        },
        start_date: {
            type: String,
        },
        total_scores: {
            type: Number,
            default: null
        },
        homework_type: {
            type: Schema.Types.ObjectId, 
            ref:  'HomeworkType'
        },
        homework_category: {
            type: Schema.Types.ObjectId,
            ref: 'HomeworkCategory',
            default: null,
        },
        document: [
            {
                type: Schema.Types.ObjectId,
                ref: 'File',
            }
        ],
        create_by: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        is_delete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps :true,
        collection: 'normal_homeworks'
    }
);

NormalHomeworkSchema.plugin(AutoIncrement,{inc_field: 'id_normal_homework'});
module.exports = mongoose.model('NormalHomework', NormalHomeworkSchema);