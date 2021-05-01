const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        user_type:{ 
            type: Schema.Types.ObjectId, 
            ref:  'UserType'
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: true
        },
        password: {
            type: String,
        },
        activated_code: {
            type: String,
            default: ''
        },
        activated: {
            type: Boolean,
            default: false
        },
        status: {
            type: Number,
            default: 1
        },
        is_deltete: {
            type: Boolean,
            default: false
        },
        social: {
            type: String,
            default: ""
        },
        social_id: {
            type: String,
            default: ""
        },
        profile: {
            name: {
                first_name: {
                    type: String,
                    default: ""
                },
                last_name: {
                    type: String,
                    default: ""
                }
            },
            gender: {
                type: String,
                default: "",
            },
            avatar: {
                type: String,
                default: ""
            },
            phone: {
                type: String,
                default: ""
            },
            address: {
                type: String,
                default: ""
            },
            about: {
                type: String,
                default: ""
            }
        }
    },
    {
        timestamps :true,
        collection: 'users'
    }
);

userSchema.plugin(AutoIncrement,{inc_field: 'id_user'});

module.exports = mongoose.model("User", userSchema);
