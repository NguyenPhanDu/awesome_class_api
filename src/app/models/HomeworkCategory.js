const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const HomeworkCategorySchema = Schema(
    {
        title: {type: String, require: true, unique: true},
        is_delete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps :true,
        collection: 'homework_categorys'
    }
);

HomeworkCategorySchema.plugin(AutoIncrement, {inc_field: 'id_homework_category'});

module.exports = mongoose.model('HomeworkCategory',HomeworkCategorySchema);