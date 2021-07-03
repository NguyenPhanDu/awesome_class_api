const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const HomeworkNotification = Schema(
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
            enum: [ 'ClassHomework', 'HomeworkAssign']
        },
        is_delete: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps :true,
        collection: 'homework_notifications'
    }
);

HomeworkNotification.plugin(AutoIncrement,{inc_field: 'id_homework_notification'});
module.exports = mongoose.model("HomeworkNotification", HomeworkNotification);