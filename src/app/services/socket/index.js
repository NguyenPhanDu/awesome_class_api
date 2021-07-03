async function socketIo(io){
    try{
        io.on("connection", socket => {
            console.log("connection")
            io.emit("push-notification", "haha");
            
            socket.on("disconnect", function () {
                console.log("disconnected");
            });
        })
    }
    catch(err){
        console.log(err)
    }
}

module.exports = socketIo;