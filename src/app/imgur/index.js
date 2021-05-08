const imgur = require('imgur');
require('dotenv').config();


function upload() {
    const clientId = '81993821c585b6a';
    imgur.setClientId(clientId);
    imgur.getClientId();
    imgur
    .saveClientId(clientId)
    .then(() => {
        console.log('Saved.');
    })
    .catch((err) => {
        console.log(err.message);
    });
    
}

module.exports = upload