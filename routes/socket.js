'use strict';
const socketIO = require('socket.io')
module.exports = function (server) {
    // function
    let User = require('../controllers/userController');
    let Pawn = require('../controllers/pawnController');
    // This creates our socket using the instance of the server
    const io = socketIO(server);
    // This is what the socket.io syntax is like, we will work this later
    io.on('connection', socket => {
        // DANG KY NGUOI DUNG
        socket.on("register", function (data) {
            let obj = JSON.parse(data);
            if (obj) { User.connect(io, socket, obj);}
        });
        //nguoi dung offline
        socket.on("disconnect", function () {
            //khi nguoi dung ngat ket noi server
            User.disconnect(socket);
        });
        // gủi tin nhắn đấu giá từ khách hàng cho những các doanh nghiệp có bán kính 10km,
        socket.on("notify-pawn-c-b", function (data) {
            let obj = JSON.parse(data);
            if (obj) { Pawn.notify(io, socket, obj);}
        });
    });
};