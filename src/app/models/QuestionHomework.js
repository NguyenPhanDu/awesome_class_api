const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

 const QuestionHomeworkSchema = Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        }
    },
    {
        timestamps :true,
        collection: 'question_homeworks'
    }
);

QuestionHomeworkSchema.plugin(AutoIncrement, {inc_field: 'id_question_homework'});

module.exports = mongoose.model('QuestionHomework',QuestionHomeworkSchema);
