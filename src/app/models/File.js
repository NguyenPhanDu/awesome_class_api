const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FileSchema = Schema(
    {
        class_news: {
            type: Schema.Types.ObjectId,
            ref: 'ClassNews',
            default: null
        },
        class_homework: {
            type: Schema.Types.ObjectId,
            ref: 'ClassHomework',
            default: null
        },
        blog: {
            type: Schema.Types.ObjectId,
            ref: 'Blog',
            default: null
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
        collection: 'files'
    }
);

FileSchema.plugin(AutoIncrement, {inc_field: 'id_files'});

module.exports = mongoose.model('File',FileSchema);