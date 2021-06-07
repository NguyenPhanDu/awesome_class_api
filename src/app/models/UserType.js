const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const UserTypeSchema = Schema(
    {
        name: {type: String, require: true, unique: true},
        is_delete: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps :true,
        collection: 'user_types'
    },
    
);

UserTypeSchema.plugin(AutoIncrement, {inc_field: 'id_user_type'});

module.exports = mongoose.model('UserType',UserTypeSchema);