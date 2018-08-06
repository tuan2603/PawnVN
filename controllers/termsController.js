'use strict';
const Terms = require('../models/termsModel'),
    {find_user_phone} = require('../controllers/userController');

let FindTerms = (obj) => {
    return new Promise((resolve, reject) => {
        Terms.findOne(obj, function (err, terms) {
            if (err) return reject(err);
            resolve(terms);
        });
    });
};

let UpdateTerms = (condition, Obj) => {
    return new Promise((resolve, reject) => {
        Terms.findOneAndUpdate(condition, Obj, {new: true}, function (err, terms) {
            if (err) reject(err);
            resolve(terms);
        });
    });
};

exports.update_terms = function (req, res) {
    let {_id, title, content} = req.body;
    let {phone} = req.user;

    if (
        phone === undefined ||
        (title === undefined &&
            content === undefined) ||
        _id === undefined
    ) {
        return res.send({
            "response": false,
            "value": "user not found or not params"
        });
    }
    find_user_phone(phone)
        .then(userf => {
                if (userf.roleType === 0) {
                    UpdateTerms({_id}, req.body)
                        .then(tempu => {
                            return res.send({
                                "response": true,
                                "value": tempu
                            });
                        }, err => {
                            return res.send({
                                "response": false,
                                "value": err
                            });
                        })
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't admin, only admin insert, update, delete category"
                    });
                }
            },
            err => {
                return res.send({
                    "response": false,
                    "value": err
                });
            }
        )
};

exports.insert_terms = function (req, res) {
    let {title, content} = req.body;
    let {phone} = req.user;
    if (phone === undefined || title === undefined || content === undefined) {
        return res.send({
            "response": false,
            "value": "user not found"
        });
    }
    find_user_phone(phone)
        .then(userf => {
                if (userf.roleType === 0) {
                    let newTems = new Terms(req.body);
                    newTems.save(function (err, term) {
                        if (err) return res.send({
                            response: false,
                            value: err,
                        });
                        res.send({
                            response: true,
                            value: term,
                        })
                    })
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't admin, only admin insert, update, delete category"
                    });
                }
            },
            err => {
                return res.send({
                    "response": false,
                    "value": err
                });
            }
        )
};


exports.get_tems_title = function (req, res) {
    let {title} = req.body;
    if (title === undefined) {
        return res.send({
            "response": false,
            "value": "user not found"
        });
    }
    Terms.findOne({title}, function (err, terms) {
        if (err) return res.send({
            response: false,
            value: err,
        });
        if (terms) {
            res.send({
                response: true,
                value: terms,
            })
        } else {
            return res.send({
                response: false,
                value: "không tìm thấy",
            });
        }

    })
};


