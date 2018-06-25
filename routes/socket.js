'use strict';
const socketIO = require('socket.io')
module.exports = function (server) {
    // This creates our socket using the instance of the server
    const io = socketIO(server);
    // This is what the socket.io syntax is like, we will work this later
    io.on('connection', socket => {
        console.log('New client connected');

        // just like on the client side, we have a socket.on method that takes a callback function
        socket.on('change color', (color) => {
            // once we get a 'change color' event from one of our clients, we will send it to the rest of the clients
            // we make use of the socket.emit method again with the argument given to use from the callback function above
            console.log('Color Changed to: ', color);
            io.sockets.emit('change color', color)
        });

        // disconnect is fired when a client leaves the server
        socket.on('disconnect', () => {
            console.log('user disconnected')
        })
    });
};