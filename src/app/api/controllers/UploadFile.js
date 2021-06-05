const drive = require('../../../config/google_drive/index');

class upLoadFile {
    async upLoadFile(req, res){
        console.log('aaa',req.files);
        // try{
        //     const response = await drive.files.create({
        //         requestBody: {
        //             name: 'fgo.jpg',
        //             mimeType: 'image/jpeg'
        //         },
        //         media: {
        //             mimeType: 'image/jpeg',
        //             body: req.body.file
        //         }
        //     })
        //     console.log(response.data)
        // }
        // catch(err){
        //     console.log(err)
        // }
    }
}

module.exports = new upLoadFile;
