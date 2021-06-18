const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ClassNewsyAssignSchema = Schema(
    {
        user: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        class_news: {
            type: Schema.Types.ObjectId,
            ref: 'ClassNews'
        },
        is_delete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps :true,
        collection: 'class_news_assigns'
    }
);

ClassNewsyAssignSchema.plugin(AutoIncrement,{inc_field: 'id_news_assign'});
module.exports = mongoose.model('ClassNotifyAssign', ClassNewsyAssignSchema)