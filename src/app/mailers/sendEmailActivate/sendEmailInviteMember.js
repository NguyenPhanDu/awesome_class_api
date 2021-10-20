const nodemailer =  require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
require('dotenv').config();

async function sendInviteMemberEmail(req,user,classObj,classMember){
    try{
    let transport = await nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'awesomeclass.work@gmail.com',
            pass: 'du0336685195'
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
        to: req.body.email_invite,
        subject: 'Awesome Class',
        template: 'invite_member',
        context: {
            from: req.body.email,
            className: classObj.name,
            classMemberId: classMember.id_class_member,
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

module.exports = sendInviteMemberEmail






