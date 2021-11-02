const nodemailer =  require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
require('dotenv').config();
const { google } = require('googleapis');

async function sendActiveMail(user){
    try{
        const oauth2Client = new google.auth.OAuth2(
            process.env.GD_CLIENT_ID,
            process.env.GD_CLIENT_SECRET,
            process.env.GD_REDIRECT_URI
        );
        
        oauth2Client.setCredentials({refresh_token: process.env.MAIL_REFESH_TOKEN});
        const accessToken = await oauth2Client.getAccessToken()

        let transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'awesomeclass.work@gmail.com',
                clientId: process.env.GD_CLIENT_ID,
                clientSecret: process.env.GD_CLIENT_SECRET,
                refreshToken: process.env.MAIL_REFESH_TOKEN,
                accessToken: accessToken
            },
        });
        transport.use('compile', hbs({
            viewEngine: {
                extName: ".hbs",
                partialsDir: path.resolve('./src/resources/views/email'),
                layoutsDir: path.resolve('./src/resources/views/layout_email'),
            },
            viewPath: path.resolve('./src/resources/views/email'),
            extName: '.hbs'
        }))
        const url = process.env.ENDPOINT+"/api/auth/active?id="+user.id_user+"&active_code="+user.activated_code;
        //{{endpoint}}/auth/active?id={{userId}}&active_code={{activatedCode}}
        const mailOptions = {
            from: 'awesomeclass.work@gmail.com',
            to: user.email,
            subject: 'Awesome Class',
            template: 'email_actived',
            context: {
                // userId: user.id_user,
                // activatedCode: user.activated_code,
                // endpoint: process.env.ENDPOINT
                url
            } 
        }
        const result = await transport.sendMail(mailOptions)
    }
    catch(err){
        console.log(err)
    }
}

module.exports = sendActiveMail






