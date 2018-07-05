'use strict';
const socketIO = require('socket.io');
let sequenceNumberByClient = new Map();
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
            sequenceNumberByClient.set(socket, socket.id);
            console.log(data);
            let obj = JSON.parse(JSON.stringify(data));
            if (obj) { User.connect(io, socket, obj);}
        });
        //nguoi dung offline
        socket.on("disconnect", function () {
            sequenceNumberByClient.delete(socket);
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
// sends each client its current sequence number
setTimeout(() => {
    for (const [client, sequenceNumber] of sequenceNumberByClient.entries()) {
        console.dir(client);
        client.emit("seq-num", sequenceNumber);
    }
    return;
},1000);
exports.sequenceNumberByClient = sequenceNumberByClient;
