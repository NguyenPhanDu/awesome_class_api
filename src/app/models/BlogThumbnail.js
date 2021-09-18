const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const BlogThumbnailSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        blog: {
            type: Schema.Types.ObjectId, 
            ref:  'Blog'
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
        collection: 'user_images'
    }
);

BlogThumbnailSchema.plugin(AutoIncrement,{inc_field: 'id_blog_thumbnail'});
module.exports = mongoose.model('BlogThumbnail', BlogThumbnailSchema);