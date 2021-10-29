const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;
const TestSchema = Schema(
    {
        title: {
            type: String,
            required: true
        },
        user: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            }
        ]
    },
    {
        timestamps :true,
        collection: 'test'
    }
);

TestSchema.plugin(AutoIncrement,{inc_field: 'id_test'});
module.exports = mongoose.model('Test', TestSchema);