const nodemailer =  require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
async function sendResetPasswordMail(req,user){
    try{
    let transport = await nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
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
        subject: 'Awesome class',
        template: 'reset_password',
        context: {
            resetCode: user.reset_code
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