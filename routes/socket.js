'use strict';
const socketIO = require('socket.io');
const User = require('../controllers/userController');
const Pawn = require('../controllers/pawnController');

module.exports = function (server) {
    // function
    // This creates our socket using the instance of the server
    const io = socketIO(server);
    // This is what the socket.io syntax is like, we will work this later
    io.on('connection', socket => {
        console.log(socket.id);
        // DANG KY NGUOI DUNG
        socket.on("register", function (data) {
            console.log(data);
            let obj = JSON.parse(JSON.stringify(data));
            if (obj) {
                User.connect(io, socket, obj);
            }
        });
        //nguoi dung offline
        socket.on("disconnect", function () {
            //khi nguoi dung ngat ket noi server
            User.disconnect(socket);
        });
        // gủi tin nhắn đấu giá từ khách hàng cho những các doanh nghiệp có bán kính 20km,
        socket.on("notify-pawn-c-b", function (data) {
            let obj = JSON.parse(data);
            if (obj) {
                Pawn.notify(io, socket, obj);
            }
        });

        // cập nhật vị trí
        socket.on("update-track-pawnowner", function (data) {
            let obj = JSON.parse(data);
            if (obj) {
                Pawn.update_track_pawnowner_lat(io, obj);
            }
        });
    });
};
