const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ClassHomeworkSchema = Schema(
    {
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        homework :
            {
                type: Schema.Types.ObjectId,
                require: true,
                refPath: 'onModel'
            }
        ,
        onModel: {
            type: String,
            require: true,
            enum: ['NormalHomework', 'QuestionHomework']
        },
        is_delete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps :true,
        collection: 'class_homeworks'
    }
);

ClassHomeworkSchema.plugin(AutoIncrement,{inc_field: 'id_class_homework'});
module.exports = mongoose.model('ClassHomework', ClassHomeworkSchema);
