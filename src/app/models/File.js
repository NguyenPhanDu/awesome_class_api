const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FileSchema = Schema(
    {
        name: {
            type: String
        },
        path: {
            type: String
        }
    },
    {
        timestamps :true,
        collection: 'file'
    }
);

FileSchema.plugin(AutoIncrement, {inc_field: 'id_file'});

module.exports = mongoose.model('File',FileSchema);