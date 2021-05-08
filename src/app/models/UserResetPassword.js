const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const UserResetPassword = Schema(
    {
        reset_code: {
            type: String,
            default: ''
        },
        id_user: Number
    },
    {
        timestamps :true,
        collection: 'user_reset_password'
    }
);

UserResetPassword.plugin(AutoIncrement, {inc_field: 'id_user_reset'});

module.exports = mongoose.model('UserReset',UserResetPassword)