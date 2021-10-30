const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const BlogSchema = new Schema(
    {
        create_by: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        thumbnail: {
            type: String,
            default: ""
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        document: [
            {
                type: Schema.Types.ObjectId,
                ref: 'File',
            }
        ],
        is_delete: {
            type: Boolean,
            default: false
        },
        create_at: {
            type: String,
            default: '',
        },
        update_at: {
            type: String,
            default: '',
        },
    },
    {
        timestamps :true,
        collection: 'blogs'
    }
);

BlogSchema.plugin(AutoIncrement,{inc_field: 'id_blog'});
module.exports = mongoose.model('Blog', BlogSchema);