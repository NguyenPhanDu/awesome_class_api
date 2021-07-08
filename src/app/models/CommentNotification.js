const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const CommentNotification = Schema(
    {
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        ref: {
            type: Schema.Types.ObjectId,
            refPath: 'onModel'
        },
        onModel: {
            type: String,
            require: true,
            enum: ['ClassNews', 'ClassHomework', 'HomeworkAssign']
        },
        // ClassNews, ClassHomework, HomeworkAssign
        type: {
            type: String
        },
        is_delete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps :true,
        collection: 'comment_notifications'
    }
);

CommentNotification.plugin(AutoIncrement,{inc_field: 'id_comment_notification'});

module.exports = mongoose.model("CommentNotification", CommentNotification);
