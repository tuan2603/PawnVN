'use strict';
const maket = require('../models/marketModel'),
    user = require('../controllers/userController');


let FindOneMaket = (obj) => {
    return new Promise((resolve, reject) => {
        maket.findOne(obj, function (err, adv) {
            if (err) return reject(err);
            resolve(adv);
        });
    });
};

let FindAllMaket = (obj) => {
    return new Promise((resolve, reject) => {
        maket.find(obj, function (err, adv) {
            if (err) return reject(err);
            resolve(adv);
        });
    });
};

let UpdateMaket = (condition, Obj) => {
    return new Promise((resolve, reject) => {
        maket.findOneAndUpdate(condition, Obj, {new: true}, function (err, adv) {
            if (err) reject(err);
            resolve(adv);
        });
    });
};

//delete on maket
let DeleteOnemMaket = (obj) => {
    return new Promise((resolve, reject) => {
        maket.findOneAndRemove(obj, function (err, adv) {
            if (err) return reject(err);
            //remove icon old
            resolve(adv);

        });
    });
}

exports.insert_one = function (req, res) {
    if (req.user.phone === undefined) {
        return res.send({
            "response": false,
            "value": "user not found"
        });
    }
    user.find_user_phone(req.user.phone)
        .then(user => {
                if (user.roleType !== 1) {
                    let newMaket = new maket(req.body);
                    newMaket.save(function (err, maket) {
                        if (err) return res.send({
                            response: false,
                            value: err,
                        });
                        res.send({
                            response: true,
                            value: maket,
                        })
                    })
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't busuness, only busuness insert, update, delete maket"
                    });
                }
            },
            err => {
                return res.send({
                    "response": false,
                    "value": "find user fail"
                });
            }
        )
};

exports.update_makets = function (req, res) {
    let {_id} = req.body;
    if (req.user.phone === undefined || _id === undefined) {
        return res.send({
            "response": false,
            "value": "user not found"
        });
    }
    user.find_user_phone(req.user.phone)
        .then(user => {
                if (user.roleType === 0) {
                    UpdateMaket({_id}, req.body).then(
                        catu => {
                            if (catu) {
                                res.send({
                                    response: true,
                                    value: catu,
                                })
                            } else {
                                return res.send({
                                    "response": false,
                                    "value": "update false"
                                });
                            }
                        }, err => {
                            return res.send({
                                "response": false,
                                "value": "update maket fail"
                            });
                        }
                    )
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't admin, only admin insert, update, delete maket"
                    });
                }
            },
            err => {
                return res.send({
                    "response": false,
                    "value": "loi tim user "
                });
            }
        )


};


exports.delete_maket = function (req, res) {
    let {_id} = req.body;
    if (req.user.phone === undefined || _id === undefined) {
        return res.send({
            "response": false,
            "value": "user not found"
        });
    }
    user.find_user_phone(req.user.phone)
        .then(user => {
                if (user.roleType === 0) {
                    DeleteOnemMaket({_id})
                        .then(advdel => {
                                if (advdel) {
                                    res.send({
                                        response: true,
                                        value: advdel,
                                    })
                                } else {
                                    return res.send({
                                        "response": false,
                                        "value": "delete false"
                                    });
                                }
                            }, err => {
                                return res.send({
                                    "response": false,
                                    "value": "err delete makets"
                                });
                            }
                        )
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't admin, only admin insert, update, delete maket"
                    });
                }
            },
            err => {
                return res.send({
                    "response": false,
                    "value": "find user fail",
                });
            }
        )
};


exports.list_maket = function (req, res) {
    FindAllMaket({status: 1})
        .then(advs => {
            res.send({
                response: true,
                value: advs,
            })
        }, (err) => {
            return res.send({
                response: false,
                value: err,
            })
        });
};

