const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FolderHomeworkSchema = Schema(
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
        },
        class_homework: {
            type: Schema.Types.ObjectId,
            ref: 'ClassHomework'
        },
        level: {
            type: String,
        },
        type: {
            type: Number
        }
    },
    {
        timestamps :true,
        collection: 'folder_homeworks'
    }
);

FolderHomeworkSchema.plugin(AutoIncrement, {inc_field: 'id_folder_homework'});

module.exports = mongoose.model('FolderHomework',FolderHomeworkSchema)