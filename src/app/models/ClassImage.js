const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ClassImageSchema = new Schema(
    {
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        image_id : {
            type: String,
            required: true
        },
        delete_hash: {
            type: String,
            required: true
        },
        image_name: {
            type: String
        },
        image_link: {
            type: String,
            required: true
        },
        is_delete: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps :true,
        collection: 'class_images'
    }
);

ClassImageSchema.plugin(AutoIncrement,{inc_field: 'id_class_image'});
module.exports = mongoose.model('ClassImage', ClassImageSchema);