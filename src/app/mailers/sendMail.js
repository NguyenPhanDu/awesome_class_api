const nodemailer =  require('nodemailer');
const {google} = require('googleapis');

const CLIENT_ID = '539380675916-rvn065ddc0l2m0h75l3uq9gtfv71r42h.apps.googleusercontent.com';
const CLIENT_SECRET = '6WpgjoB7KX3jPLVny8HJkPkW';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04_vjbIKQyPwaCgYIARAAGAQSNwF-L9Irx5m1yIoPnUDS6KHbyj-1PaemhrmQ1t19SKR1lSjpWu4ZAdxSDYXs4zkfKtogHh4OghU'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

let accessToken = oAuth2Client.getAccessToken();

let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'nguyenphanduu12@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REDIRECT_URI,
        accessToken: accessToken,
    }
})

module.exports = transport