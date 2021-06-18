const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FileNewsSchema = Schema(
    {
        class_news: {
            type: Schema.Types.ObjectId,
            ref: 'ClassNews',
        },
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        create_by: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        type: {
            type: Number
        },
        id_file: {
            type: String
        },
        name: {
            type: String
        },
        parent : {
            type: Schema.Types.ObjectId, 
            ref: 'Folder'
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
        },
        level: {
            type: Number
        }
    },
    {
        timestamps :true,
        collection: 'file_news'
    }
);

FileNewsSchema.plugin(AutoIncrement, {inc_field: 'id_file_news'});

module.exports = mongoose.model('FileNews',FileNewsSchema);