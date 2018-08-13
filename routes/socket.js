'use strict';
const socketIO = require('socket.io');
const {connect, disconnect} = require('../controllers/onlineController');
const Pawn = require('../controllers/pawnController');

module.exports = function (server) {
    // function
    // This creates our socket using the instance of the server
    const io = socketIO(server);
    // This is what the socket.io syntax is like, we will work this later
    io.on('connection', socket => {
        // DANG KY NGUOI DUNG
        console.log("ket noi socket",socket.id);
        socket.on("register", function (data) {
            let obj = null;
            if	(typeof data === "string"){
                obj = JSON.parse(data);
            } else{
                obj = JSON.parse(JSON.stringify(data));
            }
            if (obj) {
                connect({io, socket, info:obj});
            }
        });
        //nguoi dung offline
        socket.on("disconnect", function () {
            //khi nguoi dung ngat ket noi server
            disconnect(socket.id);
        });
        // gủi tin nhắn đấu giá từ khách hàng cho những các doanh nghiệp có bán kính 20km,
        socket.on("notify-pawn-c-b", function (data) {
            let obj = null;
            if	(typeof data === "string"){
                obj = JSON.parse(data);
            } else{
                obj = JSON.parse(JSON.stringify(data));
            }
            if (obj) {
                Pawn.notify({io, socket, pawn:obj});
            }
        });

        // cập nhật vị trí
        socket.on("update-track-pawnowner", function (data) {
            let obj = null;
            if	(typeof data === "string"){
                obj = JSON.parse(data);
            } else{
                obj = JSON.parse(JSON.stringify(data));
            }
            if (obj) {
                Pawn.update_track_pawnowner_lat(io, obj);
            }
        });

        // cập nhật vị trí
        socket.on("update-start-comming", function (data) {
            let info = null;
            if	(typeof data === "string"){
                info = JSON.parse(data);
            } else{
                info = JSON.parse(JSON.stringify(data));
            }
            if (info) {
                Pawn.update_start_comming({io, info, socket});
            }
        });

        // send notification send auction
        socket.on("notify-insert-pawn-auction", function (data) {
            let info = null;
            if	(typeof data === "string"){
                info = JSON.parse(data);
            } else{
                info = JSON.parse(JSON.stringify(data));
            }
            if (info) {
                Pawn.notify_insert_auction({io, info});
            }
        });

        // send notification choose auction
        socket.on("notify-choose-pawn-auction", function (data) {
            let info = null;
            if	(typeof data === "string"){
                info = JSON.parse(data);
            } else{
                info = JSON.parse(JSON.stringify(data));
            }
            if (info) {
                Pawn.notify_choose_auction({io, info});
            }
        });

        // Request disbursement verify
        socket.on("request-disbursement-verify", function (data) {
            let info = null;
            if	(typeof data === "string"){
                info = JSON.parse(data);
            } else{
                info = JSON.parse(JSON.stringify(data));
            }
            if (info) {
                Pawn.request_disbursement_verify({io, socket, info});
            }
        });

        //disbursement verify
        socket.on("disbursement-verify", function (data) {
            let info = null;
            if	(typeof data === "string"){
                info = JSON.parse(data);
            } else{
                info = JSON.parse(JSON.stringify(data));
            }
            if (info) {
                Pawn.disbursement_verify({io, socket, info});
            }
        });

    });
};
