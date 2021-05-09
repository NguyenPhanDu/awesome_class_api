const nodemailer =  require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
async function sendActiveMail(req,user){
    try{
    let transport = await nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'awesomeclass.work@gmail.com',
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
        from: 'awesomeclass.work@gmail.com',
        to: req.body.email,
        subject: 'Test Nodemailer',
        template: 'email_actived',
        context: {
            userId: user.id_user,
            activatedCode: user.activated_code,
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






