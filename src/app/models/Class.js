const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ClassSchema = new Schema({
    admin: {
        type: Schema.Types.ObjectId, 
        ref:  'User'
    },
    name: {
        type: String,
        required: true
    },
    class_code: {
        type: String,
        required: true,
        unique: true
    },
    is_deltete: {
        type: Boolean,
        default: false
    },
},
{
    timestamps :true,
    collection: 'classes'
}
);

ClassSchema.plugin(AutoIncrement,{inc_field: 'id_class'});
module.exports = mongoose.model('Class', ClassSchema);