const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ImageSchema = new Schema(
    {
        ref :
            {
                type: Schema.Types.ObjectId,
                require: true,
                refPath: 'onModel'
            }
        ,
        onModel: {
            type: String,
            require: true,
            enum: ['User', 'Class', 'Blog']
        },
        // 1: avatar, 2 ảnh bìa, 3 thumnail
        image_type: {
            type: Number,
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
        collection: 'images'
    }
);

ImageSchema.plugin(AutoIncrement,{inc_field: 'id_image'});
module.exports = mongoose.model('Image', ImageSchema);