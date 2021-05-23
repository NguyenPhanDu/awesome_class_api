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
            type: String
        },
        deadline: {
            type: String
        },
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        homework_type: {
            type: Schema.Types.ObjectId, 
            ref:  'Homework'
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
        }
    },
    {
        timestamps :true,
        collection: 'exercise_types'
    }
)