'use strict';

const mongoose = require('mongoose'),
    Code = mongoose.model('VerifyCode');

exports.list_all_verify = function (req, res) {
    Code.find({}, function(err, task) {
        if (err)
            res.send(err);
        res.json(task);
    });
};

let findAllFollowPhone = (phone) => {
    return new Promise((resolve, reject) => {
        Code.find({phone: phone}, function (err, codes) {
            if (err) reject(err);
            resolve(codes);
        });
    });
}
exports.findAllFollowPhone = findAllFollowPhone;
