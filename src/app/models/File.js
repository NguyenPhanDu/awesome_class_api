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
        is_deltete: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps :true,
        collection: 'files'
    }
);

FileSchema.plugin(AutoIncrement, {inc_field: 'id_file'});

module.exports = mongoose.model('File',FileSchema);