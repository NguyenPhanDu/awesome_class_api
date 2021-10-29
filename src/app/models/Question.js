const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    options: [{
        type: String,
    }],
    scores: {
        type: Number,
        default: 0
    },
    is_delete: {
        type: Boolean,
        default: false
    },
    answer: {
        type: Number,
        required: true
    }
},
{
    timestamps :true,
    collection: 'questions'
}
);

QuestionSchema.plugin(AutoIncrement,{inc_field: 'id_question'});
module.exports = mongoose.model('Question', QuestionSchema);