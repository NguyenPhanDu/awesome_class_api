const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FolderClassSchema = Schema(
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
        folder: {
            type: Schema.Types.ObjectId,
            ref: 'Folder'
        }
    },
    {
        timestamps :true,
        collection: 'folder_classes'
    }
);

FolderClassSchema.plugin(AutoIncrement, {inc_field: 'id_folder_class'});

module.exports = mongoose.model('FolderClass',FolderClassSchema)