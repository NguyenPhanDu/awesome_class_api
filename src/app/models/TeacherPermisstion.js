const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const TeacherPermisstionSchema = new Schema(
    {
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        is_delete: {
            type: Boolean,
            default: false
        },
        invite: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps :true,
        collection: 'teacher_permisstion'
    }
);

TeacherPermisstionSchema.plugin(AutoIncrement,{inc_field: 'id_teacher_permisstion'});
module.exports = mongoose.model('TeacherPermisstion', TeacherPermisstionSchema);