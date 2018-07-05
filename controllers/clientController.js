'use strict';
const clients = require('../models/clientModel');
let insert_client = (obj) => {
    return new Promise((resolve, reject) => {
        let newClients = new clients(obj);
        newClients.save(function (err, cli) {
            if (err) return reject(err);
            resolve(cli);
        })
    })
};
exports.insert_client = insert_client;

let delete_one_client = (socket_id) => {
    return new Promise((resolve, reject) => {
        clients.deleteOne({socket_id:socket_id}, function(err, obj) {
            if (err) throw reject(err);
            resolve(obj);
        });
    })
};
exports.delete_one_client = delete_one_client;

let find_one_socket_id = (socket_id) => {
    clients.findOne({socket_id:socket_id}, function (err, cli) {
        if (err) return reject(err);
        resolve(cli);
    })
};
exports.find_one_socket_id = find_one_socket_id;


