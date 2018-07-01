'use strict';
const socketIO = require('socket.io')
module.exports = function (server) {
    // This creates our socket using the instance of the server
    const io = socketIO(server);
    // This is what the socket.io syntax is like, we will work this later
    io.on('connection', socket => {
        console.log(socket);
        
    });
};