const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ClassRoleSchema = Schema(
    {
        name: {type: String, require: true, unique: true}
    },
    {
        timestamps :true,
        collection: 'class_role'
    }
);

ClassRoleSchema.plugin(AutoIncrement, {inc_field: 'id_class_role'});
module.exports = mongoose.model('ClassRole', ClassRoleSchema);