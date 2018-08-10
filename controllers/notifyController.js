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

exports.update_view_notification_for_one_user = (req, res) => {
    let {_id} = req.user;
    if ( _id === undefined) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }

    Notify.updateMany({to_id:_id},{status: 1},function(err,arr) {
        if(err) return res.send({
            "response": false,
            "value": err,
        });

        return res.send({
            "response": true,
            "value": arr,
        });
    });

};

exports.update_one_notification_for_one_user = (req, res) => {
    let {_id} = req.user;
    let {notification_id} = req.body;
    if ( _id === undefined || notification_id === undefined ) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    UpdateOneNotify({_id:notification_id, to_id: _id}, req.body)
        .then(notifiud=>{
            if (notifiud) {
                return res.send({
                    "response": true,
                    "value": notifiud,
                });
            }else{
                return res.send({
                    "response": false,
                    "value": "update fail",
                });
            }
        },err=>{
            return res.send({
                "response": false,
                "value": err,
            });
        })

};

let delete_notification_old = () => {
    FindAllNotify({create_at:{$lt: Date.now()-2592000000}, status: 0})
        .then(notis=>{
           if (notis.length > 0) {
               notis.map((noti=>{
                   DeleteOneNotify({_id:noti._id})
                       .then(notidel=>{
                           if (notidel) {
                               console.log(" deleted notification old", notidel.content);
                           }
                       })
               }))
           }
        })
};

exports.CreateNotify = CreateNotify;
exports.delete_notification_old = delete_notification_old;
