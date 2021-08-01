const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const StudentPermisstionSchema = new Schema(
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
        collection: 'student_permisstion'
    }
);

StudentPermisstionSchema.plugin(AutoIncrement,{inc_field: 'id_student_permisstion'});
module.exports = mongoose.model('StudentPermisstion', StudentPermisstionSchema);