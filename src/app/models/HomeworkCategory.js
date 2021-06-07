const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const HomeworkCategorySchema = Schema(
    {
        title: {type: String, require: true},
        is_delete: {
            type: Boolean,
            default: false
        },
        user: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
    },
    {
        timestamps :true,
        collection: 'homework_categories'
    }
);

HomeworkCategorySchema.plugin(AutoIncrement, {inc_field: 'id_homework_category'});

module.exports = mongoose.model('HomeworkCategory',HomeworkCategorySchema);