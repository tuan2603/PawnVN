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

exports.get_all_notification_for_one_user = (req, res) => {
    let {_id} = req.user;
    let {page, limit} = req.body;
    if ( _id === undefined || page === undefined || limit === undefined) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }

    Notify.find({to_id:_id})
        .limit(limit*1)
        .skip(limit*1*(page-1))
        .sort({ create_at: -1 })
        .exec(function (err, noties) {
        if (err) return  res.send({
            "response": false,
            "value": err
        });
        if (noties.length > 0) {
            return res.send({
                "response": true,
                "value": noties
            });
        } else {
            return res.send({
                "response": false,
                "value": "not found notification"
            });
        }
    });

};

exports.CreateNotify = CreateNotify;
