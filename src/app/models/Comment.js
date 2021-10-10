const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const CommentSchema = Schema(
    {
        content: {
            type: String,
            required : true
        },
        user: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        ref: {
            type: Schema.Types.ObjectId,
            refPath: 'onModel'
        },
        onModel: {
            type: String,
            require: true,
            enum: ['ClassNews', 'ClassHomework', 'SubmitHomework']
        },
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
        collection: 'comments'
    }
);


CommentSchema.plugin(AutoIncrement,{inc_field: 'id_comment'});

module.exports = mongoose.model("Comment", CommentSchema);