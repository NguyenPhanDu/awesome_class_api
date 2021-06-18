const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FolderClassNews = Schema(
    {
        is_delete: {
            type: Boolean,
            default: false
        },
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        create_by: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        class_news : {
            type: Schema.Types.ObjectId,
            ref: 'ClassNews'
        },
        folder: {
            type: Schema.Types.ObjectId,
            ref: 'Folder'
        },
        level: {
            type: Number,
        },
        type: {
            type: Number
        }
    },
    {
        timestamps :true,
        collection: 'folder_class_new'
    }
);

FolderClassNews.plugin(AutoIncrement, {inc_field: 'id_folder_news'});

module.exports = mongoose.model('FolderClassNews',FolderClassNews)