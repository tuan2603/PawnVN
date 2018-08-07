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

let FindAllTerm = (obj) => {
    return new Promise((resolve, reject) => {
        Terms.find(obj, function (err, terms) {
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

//delete on page
let DeleteOnePage = (obj) => {
    return new Promise((resolve, reject) => {
        Terms.findOneAndRemove(obj, function (err, page) {
            if (err) return reject(err);
            resolve(page);
        });
    });
}

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

exports.get_all_term = function (req, res) {
    FindAllTerm({})
        .then(termf=>{
            if (termf) {
                res.send({
                    response: true,
                    value: termf,
                })
            } else {
                return res.send({
                    response: false,
                    value: "not found pages",
                });
            }
        },err=>{
            return res.send({
                response: false,
                value: err,
            });
        })
};

exports.delete_page = function (req, res) {
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
                    DeleteOnePage({_id})
                        .then(pagedel => {
                                if (pagedel) {
                                    res.send({
                                        response: true,
                                        value: pagedel,
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
                                    "value": err
                                });
                            }
                        )
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
                    "value": err,
                });
            }
        )
};


