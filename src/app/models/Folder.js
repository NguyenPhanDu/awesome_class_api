const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;
// BỎ ĐI
const FolderSchema = Schema(
    {
        id_folder: {
            type: String
        },
        name: {
            type: String
        },
        path: {
            type: String,
            default: ''
        },
        parent : this,
        is_delete: {
            type: Boolean,
            default: false
        },
        level: {
            type: Number
        },
        type: {
            type: Number
        }
    },
    {
        timestamps :true,
        collection: 'folders'
    }
);

FolderSchema.plugin(AutoIncrement, {inc_field: 'id_folders'});

module.exports = mongoose.model('Folder',FolderSchema);