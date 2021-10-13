const util = require("util");
const multer = require("multer");
const maxSize = 10 * 1024 * 1024;
const path = require('path');
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir+"/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).array("files",5);

//let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFile;