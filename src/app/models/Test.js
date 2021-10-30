const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;
const TestSchema = Schema(
    {
        questions: [
            {
                type:  mongoose.SchemaTypes.Mixed
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