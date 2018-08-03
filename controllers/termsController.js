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

let update_terms = function (req, res) {
    let {_id} = req.body;
    let {phone} = req.user;
    if (
        phone === undefined ||
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

let insert_terms = function (req, res) {

    if (req.user.phone === undefined) {
        return res.send({
            "response": false,
            "value": "user not found"
        });
    }
    find_user_phone(req.user.phone)
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

exports.insert_and_update = (req, res) =>{
    let {_id} = req.body;
    if (_id === undefined ) {
        insert_terms(req, res);
    } else {
        update_terms(req, res);
    }
}

exports.list_terms = function (req, res) {
    Terms.findOne({}, function (err, terms) {
        if (err) return res.send({
            response: false,
            value: err,
        });
        res.send({
            response: true,
            value: terms,
        })
    })
};

