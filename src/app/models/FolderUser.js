const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FolderUserSchema = Schema(
    {
        is_delete: {
            type: Boolean,
            default: false
        },
        user: {
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
        collection: 'foler_users'
    }
);
FolderUserSchema.plugin(AutoIncrement, {inc_field: 'id_folder_user'});
module.exports = mongoose.model('FolderUser',FolderUserSchema);