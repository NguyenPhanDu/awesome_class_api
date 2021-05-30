const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const NormalHomeworkSchema = Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        deadline: {
            type: String,
            default: "",
        },
        start_date: {
            type: String,
            default: ""
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
                ref:  'File'
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