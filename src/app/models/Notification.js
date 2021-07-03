const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const NotificationSchema = Schema(
    {
        is_read: {
            type: Boolean,
            default: false
        },
        sender: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        receiver: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        create_at: String,
        is_delete: {
            type: Boolean,
            default: false
        },
        ref: {
            type: Schema.Types.ObjectId,
            refPath: 'type'
        },
        onModel: {
            type: String,
            require: true,
            enum: [ 'HomeworkNotification', 'CommentNotification']
        },
    },
    {
        timestamps :true,
        collection: 'notifications'
    }
);

NotificationSchema.plugin(AutoIncrement,{inc_field: 'id_notification'});
module.exports = mongoose.model("Notification", NotificationSchema);