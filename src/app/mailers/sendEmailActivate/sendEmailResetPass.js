const nodemailer =  require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
async function sendResetPasswordMail(req){
    try{
    let transport = await nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'phandunguyen.work@gmail.com',
            pass: 'du0169460307'
        },
        tls: {
            rejectUnauthorized: false
        }
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
    var mailOptions = {
        from: 'phandunguyen.work@gmail.com',
        to: req.body.email,
        subject: 'Test Nodemailer',
        template: 'reset_password',
        context: {
            name: 'ResetPassword rrrrr'
        } 
    }
    await transport.sendMail(mailOptions, (err, info) => {
        if (err) console.log(err);
        console.log(info)
    })
    }
    catch(err){
        console.log(err)
    }
}

module.exports = sendResetPasswordMail