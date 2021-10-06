const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FolderClassSchema = Schema(
    {
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        id_folder: {
            type: String
        },
        path: {
            type: String,
            default: ''
        },
        is_delete: {
            type: Boolean,
            default: false
        },
        name: {
            type: String
        }
    },
    {
        timestamps :true,
        collection: 'folder_classes'
    }
);

FolderClassSchema.plugin(AutoIncrement, {inc_field: 'id_folder_class'});

module.exports = mongoose.model('FolderClass',FolderClassSchema)