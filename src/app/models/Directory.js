const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const DirectorySchema = Schema(
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
        refId: {
            type: String
        },
        is_deltete: {
            type: Boolean,
            default: false
        },
        mimeType: {
            type: String
        }
    },
    {
        timestamps :true,
        collection: 'directories'
    }
);

DirectorySchema.plugin(AutoIncrement, {inc_field: 'id_directory'});

module.exports = mongoose.model('Directory',DirectorySchema);