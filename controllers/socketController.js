'use strict';
const socket = require('../models/socket');

exports.insert_one = function (req, res) {
    let newsocket = new socket(req.body);
    newsocket.save(function (err,sk) {
        if (err) return res.send({
            respone:false,
            value:err,
        });
        res.send({
            respone:true,
            value:sk,
        })
    })
};

let findAllSocket = () => {
    return new Promise((resolve, reject) => {
        socket.find({}, function (err, sk) {
            if (err) return reject(err);
            resolve(sk);
        });
    });
};
exports.findAllSocket = findAllSocket;

exports.list_socket = function (req, res) {
    socket.find({},function (err,sk) {
        if (err) return res.send({
            respone:false,
            value:err,
        });
        res.send({
            respone:true,
            value:sk,
        })
    })
};
