const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FileSchema = Schema(
    {
        id_file: {
            type: String
        },
        name: {
            type: String
        },
        parent : {
            type: Schema.Types.ObjectId, 
            ref:  'Directory'
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