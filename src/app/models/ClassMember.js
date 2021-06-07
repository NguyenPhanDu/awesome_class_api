const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ClassMemberSchema = Schema({
    user: {
        type: Schema.Types.ObjectId, 
        ref:  'User'
    },
    role: {
        type: Schema.Types.ObjectId, 
        ref:  'ClassRole'
    },
    class: {
        type: Schema.Types.ObjectId, 
        ref:  'Class'
    },
    status: {
        type: Number,
    },
    is_delete: {
        type: Boolean,
        default: false
    },
},{
    timestamps :true,
    collection: 'class_member'
});

ClassMemberSchema.plugin(AutoIncrement,{inc_field: 'id_class_member'});
module.exports = mongoose.model('ClassMember', ClassMemberSchema);