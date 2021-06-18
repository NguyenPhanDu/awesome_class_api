const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;
require('./File');
const ClassNewsSchema = Schema({
    user: {
        type: Schema.Types.ObjectId, 
        ref:  'User'
    },
    class: {
        type: Schema.Types.ObjectId, 
        ref:  'Class'
    },
    title: {
        type: String,
        default: ''
    },
    document: [
        {
            type: Schema.Types.ObjectId,
            ref: 'FileNews',
        }
    ],
    description: {
        type: String,
        default: '',
    },
    create_at: {
        type: String,
        default: '',
    },
    update_at: {
        type: String,
        default: '',
    },
    is_delete: {
        type: Boolean,
        default: false
    }
},
{
    timestamps :true,
    collection: 'class_news'
}
    
);

ClassNewsSchema.plugin(AutoIncrement,{inc_field: 'id_class_news'});
module.exports = mongoose.model("ClassNews", ClassNewsSchema);