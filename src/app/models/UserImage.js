const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const UserImageSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        // 1: avatar, 2 ảnh bìa
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
        is_deltete: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps :true,
        collection: 'user_images'
    }
);

UserImageSchema.plugin(AutoIncrement,{inc_field: 'id_user_image'});
module.exports = mongoose.model('UserImage', UserImageSchema);