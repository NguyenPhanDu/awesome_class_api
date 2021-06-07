const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ClassPermissionSchema = Schema(
    {
        joinable_by_code: {
            type: Boolean,
            default: true
        },
        able_invite_by_student: {
            type: Boolean,
            default: true
        },
        is_delete: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps :true,
        collection: 'class_permissions'
    }
)

ClassPermissionSchema.plugin(AutoIncrement,{inc_field: 'id_class_permission'});
module.exports = mongoose.model('ClassPermission', ClassPermissionSchema);