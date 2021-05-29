const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const HomeworkTypeSchema = Schema(
    {
        name: {type: String, require: true, unique: true},
        is_delete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps :true,
        collection: 'homework_types'
    }
);

HomeworkTypeSchema.plugin(AutoIncrement, {inc_field: 'id_homework_type'});

module.exports = mongoose.model('HomeworkType',HomeworkTypeSchema);