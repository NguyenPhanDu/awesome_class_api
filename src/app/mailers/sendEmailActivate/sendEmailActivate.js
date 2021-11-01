const nodemailer =  require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
require('dotenv').config();
const { google } = require('googleapis');

async function sendActiveMail(user){
    try{
        const viewPath = path.resolve(__dirname, '..', 'app', 'views', 'emails');
        console.log("viewPath: ",viewPath)
        const oauth2Client = new google.auth.OAuth2(
            process.env.GD_CLIENT_ID,
            process.env.GD_CLIENT_SECRET,
            process.env.GD_REDIRECT_URI
        );
        
        oauth2Client.setCredentials({refresh_token: process.env.MAIL_REFESH_TOKEN});
        const accessToken = await oauth2Client.getAccessToken()

        let transport = await nodemailer.createTransport({
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
            viewPath: './src/resources/views/email',
            extName: '.hbs'
        }))
        const mailOptions = {
            from: 'awesomeclass.work@gmail.com',
            to: user.email,
            subject: 'Awesome Class',
            template: 'email_actived',
            context: {
                userId: user.id_user,
                activatedCode: user.activated_code,
                endpoint: process.env.ENDPOINT
            } 
        }
        transport.sendMail(mailOptions)
    }
    catch(err){
        console.log(err)
    }
}

module.exports = sendActiveMail






