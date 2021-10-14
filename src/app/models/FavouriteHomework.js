const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const FavourateHomeworkSchema = new Schema(
    {
        class_homework: {
            type: Schema.Types.ObjectId, 
            ref:  'ClassHomework'
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
            default: 'FAVOURATE_EXERCISE'
        }
    },
    {
        timestamps :true,
        collection: 'favourite_homeworks'
    }
);

FavourateHomeworkSchema.plugin(AutoIncrement,{inc_field: 'id_favourite_homework'});

module.exports = mongoose.model("FavourateHomework", FavourateHomeworkSchema);