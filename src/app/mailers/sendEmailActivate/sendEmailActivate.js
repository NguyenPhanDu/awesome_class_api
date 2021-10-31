const nodemailer =  require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
require('dotenv').config();
async function sendActiveMail(req,user){
    try{
    let transport = await nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'awesomeclass.work@gmail.com',
            pass: 'du0336685195'
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
    var mailOptions = {
        from: 'awesomeclass.work@gmail.com',
        to: req.body.email,
        subject: 'Awesome Class',
        template: 'email_actived',
        context: {
            userId: user.id_user,
            activatedCode: user.activated_code,
            endpoint: process.env.ENDPOINT
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

module.exports = sendActiveMail






