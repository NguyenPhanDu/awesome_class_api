const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GD_CLIENT_ID,
    process.env.GD_CLIENT_SECRET,
    process.env.GD_REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token: process.env.GD_REFESH_TOKEN});

const drive = google.drive({
    version : 'v3',
    auth : oauth2Client
});
module.exports = drive;