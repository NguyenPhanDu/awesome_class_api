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
        content: {
            type: String,
            default: ""
        },
        onModel: {
            type: String,
            require: true,
            enum: ['ClassNews', 'ClassHomework', 'HomeworkAssign']
        },
        data: {
            type: Schema.Types.ObjectId,
            refPath: 'onModel'
        },
    },
    {
        timestamps :true,
        collection: 'notifications'
    }
)