const nodemailer =  require('nodemailer');
const {google} = require('googleapis');

const CLIENT_ID = '539380675916-rvn065ddc0l2m0h75l3uq9gtfv71r42h.apps.googleusercontent.com';
const CLIENT_SECRET = '6WpgjoB7KX3jPLVny8HJkPkW';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04_vjbIKQyPwaCgYIARAAGAQSNwF-L9Irx5m1yIoPnUDS6KHbyj-1PaemhrmQ1t19SKR1lSjpWu4ZAdxSDYXs4zkfKtogHh4OghU'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

async function sendActiveMail(req,user){
    try{
    // oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});
    // let accessToken = oAuth2Client.getAccessToken();
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
    let content = '';
    content += `
        <div style="padding: 10px; background-color: #003375">
            <div style="padding: 10px; background-color: white;">
                <h4 style="color: #0085ff">Welcome to Awesome Class</h4>
                <span style="color: black">Đây là mail test</span>
                <a href="http://localhost:8000/auth/active?id=${user.id_user}&active_code=${user.activated_code}">Click to active your account</a>
            </div>
        </div>
    `;
    var mailOptions = {
        from: 'phandunguyen.work@gmail.com',
        to: req.body.email,
        subject: 'Test Nodemailer',
        text: 'Your text is here',
        html: content 
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






