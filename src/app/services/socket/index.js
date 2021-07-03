async function socketIo(io){
    try{
        io.on("connection", socket => {
            console.log("connection")
        })
    }
    catch(err){
        console.log(err)
    }
}

module.exports = socketIo;