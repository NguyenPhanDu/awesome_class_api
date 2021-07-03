async function socketIo(io){
    try{
        io.on("connection", socket => {
            console.log("connection")
            io.emit("push-notification", "haha");
        })
    }
    catch(err){
        console.log(err)
    }
}

module.exports = socketIo;