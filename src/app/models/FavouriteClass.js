const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FavourateClassSchema = new Schema(
    {
        class: {
            type: Schema.Types.ObjectId, 
            ref:  'Class'
        },
        is_delete: {
            type: Boolean,
            default: false
        },
        user: {
            type: Schema.Types.ObjectId, 
            ref:  'User'
        },
        type: {
            type: String,
            default: 'class'
        }
    },
    {
        timestamps :true,
        collection: 'favourite_classes'
    }
);

FavourateClassSchema.plugin(AutoIncrement,{inc_field: 'id_favourite_class'});

module.exports = mongoose.model("FavourateClass", FavourateClassSchema);