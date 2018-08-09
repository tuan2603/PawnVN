'use strict';
const Notify = require('../models/notifyModel');


let FindAllNotify = (obj) => {
    return new Promise((resolve, reject) => {
        Notify.find(obj, function (err, users) {
            if (err) reject(err);
            resolve(users);
        });
    });
};

let FindOneNotify = (obj) => {
    return new Promise((resolve, reject) => {
        Notify.findOne(obj, function (err, users) {
            if (err) reject(err);
            resolve(users);
        });
    });
};

let UpdateOneNotify = (condition, updateinfo) => {
    return new Promise((resolve, reject) => {
        Notify.findOneAndUpdate(condition, updateinfo, {new: true}, function (err, user) {
            if (err) return reject(err);
            resolve(user);
        });
    });
}

let DeleteOneNotify = (obj) => {
    return new Promise((resolve, reject) => {
        Notify.findOneAndRemove(obj, function (err, usero) {
            if (err) return reject(err);
            resolve(usero);
        });
    });
};

let CreateNotify = (obj) => {
    return new Promise((resolve, reject) => {
        let newUser = new Notify(obj);
        newUser.save(function (err, user) {
            if (err) return reject(err);
            resolve(user);
        });
    });
};

exports.CreateNotify = CreateNotify;
