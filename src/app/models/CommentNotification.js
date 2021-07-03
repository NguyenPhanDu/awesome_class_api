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
            refPath: 'type'
        },
        type: {
            type: String,
            require: true,
            enum: ['ClassNews', 'ClassHomework', 'HomeworkAssign']
        },
        is_delete: {
            type: Boolean,
            default: false
        },
        comment: {
            type: Schema.Types.ObjectId, 
            ref:  'Comment'
        }
    },
    {
        timestamps :true,
        collection: 'comment_notifications'
    }
);

CommentNotification.plugin(AutoIncrement,{inc_field: 'id_comment_notification'});

module.exports = mongoose.model("CommentNotification", CommentNotification);
