const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;
require('./File');
const MutilChoiceHomeworkSchema = Schema(
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
        },
        questions: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Question',
            }
        ]
    },
    {
        timestamps :true,
        collection: 'mutil_choices'
    }
);

MutilChoiceHomeworkSchema.plugin(AutoIncrement,{inc_field: 'id_mutil_choice'});
module.exports = mongoose.model('MutilChoiceHomework', MutilChoiceHomeworkSchema);