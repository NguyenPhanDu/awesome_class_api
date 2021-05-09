const imgur = require('imgur');
require('dotenv').config();
imgur.setCredentials(process.env.EMAIL_IMGUR,process.env.PASSWORD_IMGUR ,process.env.IMGUR_CLIENT_ID);

module.exports = imgur