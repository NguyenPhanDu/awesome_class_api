const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ClassNewsNotication = Schema(
    {
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        ref: {
            type: Schema.Types.ObjectId,
            refPath: 'onModel'
        },
        onModel: {
            type: String,
            require: true,
            enum: ['ClassNews']
        },
        // create == tạo, update
        type: {
            type: String
        },
        is_delete: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps :true,
        collection: 'news_notifications'
    }
);

ClassNewsNotication.plugin(AutoIncrement,{inc_field: 'id_news_notification'});
module.exports = mongoose.model("ClassNewsNotication", ClassNewsNotication);