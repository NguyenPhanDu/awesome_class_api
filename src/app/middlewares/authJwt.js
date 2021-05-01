const secretKeyJwt = require('../../config/auth')
const jwt = require('jsonwebtoken');

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    console.log("token",token)
    if(token == null){
        return res.status(403).json({
            success: false,
            message: 'No token provided!'
        })
    }
    jwt.verify(token, secretKeyJwt.secret, (error, user)=>{
            if (error) {
                return res.status(401).json({ message: "Unauthorized!" });
            }
            req.userId = user._id;
            next();
    })

}
module.exports = {verifyToken}