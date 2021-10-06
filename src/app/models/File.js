const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FileSchema = Schema(
    {
        ref: {
            type: Schema.Types.ObjectId,
            require: true,
            refPath: 'onModel'
        },
        onModel: {
            type: String,
            require: true,
            enum: ['ClassHomework', 'ClassNews','Blog','SubmitHomework']
        },
        create_by: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        type: {
            type: String
        },
        id_file: {
            type: String
        },
        name: {
            type: String
        },
        parent : {
            type: Schema.Types.ObjectId, 
            ref: 'FolderClass'
        },
        path: {
            type: String,
            default: ''
        },
        mimeType: {
            type: String
        },
        is_delete: {
            type: Boolean,
            default: false
        },
        viewLink: {
            type: String,
            default: ""
        },
        downloadLink: {
            type: String,
            default: ""
        },
        size: {
            type: Number,
        }
    },
    {
        timestamps :true,
        collection: 'files'
    }
);

FileSchema.plugin(AutoIncrement, {inc_field: 'id_files'});

module.exports = mongoose.model('File',FileSchema);