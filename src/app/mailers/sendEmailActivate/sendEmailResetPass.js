const nodemailer =  require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
const { google } = require('googleapis');
async function sendResetPasswordMail(req,user){
    try{
        // const oauth2Client = new google.auth.OAuth2(
        //     process.env.GD_CLIENT_ID,
        //     process.env.GD_CLIENT_SECRET,
        //     process.env.GD_REDIRECT_URI
        // );
        
        // oauth2Client.setCredentials({refresh_token: process.env.MAIL_REFESH_TOKEN});
        // const accessToken = await oauth2Client.getAccessToken()

        let transport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'awesomeclass.work@gmail.com',
                pass: 'du0336685195'
                // clientId: process.env.GD_CLIENT_ID,
                // clientSecret: process.env.GD_CLIENT_SECRET,
                // refreshToken: process.env.MAIL_REFESH_TOKEN,
                // accessToken: accessToken
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
            to: req.body.email,
            subject: 'Awesome class',
            template: 'reset_password',
            context: {
                resetCode: user.reset_code
            } 
        }
        transport.sendMail(mailOptions, (err, info) => {
            if (err) console.log(err);
            console.log(info)
        })
    }
    catch(err){
        console.log(err)
    }
}

module.exports = sendResetPasswordMail