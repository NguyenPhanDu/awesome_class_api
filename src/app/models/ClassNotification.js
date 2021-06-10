const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ClassNotificationSchema = Schema({
    user: {
        type: Schema.Types.ObjectId, 
        ref:  'User'
    },
    class: {
        type: Schema.Types.ObjectId, 
        ref:  'Class'
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    create_at: {
        type: String,
        default: '',
    },
    update_at: {
        type: String,
        default: '',
    },
    is_delete: {
        type: Boolean,
        default: false
    }
},
{
    timestamps :true,
    collection: 'class_notifications'
}
    
);

ClassNotificationSchema.plugin(AutoIncrement,{inc_field: 'id_class_notify'});
module.exports = mongoose.model("ClassNotification", ClassNotificationSchema);