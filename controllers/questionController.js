'use strict';
const questions = require('../models/questionModel'),
    users = require('../controllers/userController'),
    config = require('../config');

let FindOneQuestion = (obj) => {
    return new Promise((resolve, reject) => {
        questions.findOne(obj, function (err, question) {
            if (err) return reject(err);
            resolve(question);
        });
    });
};

let FindAllQuestion = (obj) => {
    return new Promise((resolve, reject) => {
        questions.find(obj, function (err, question) {
            if (err) return reject(err);
            resolve(question);
        });
    });
};

let UpdateQuestion = (condition, Obj) => {
    return new Promise((resolve, reject) => {
        questions.findOneAndUpdate(condition, Obj, {new: true}, function (err, question) {
            if (err) reject(err);
            resolve(question);
        });
    });
};

//delete on Question
let DeleteOneQuestion = (obj) => {
    return new Promise((resolve, reject) => {
        questions.findOneAndRemove(obj, function (err, question) {
            if (err) return reject(err);
            //remove icon old
            resolve(question);

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
    users.find_user_phone(req.user.phone)
        .then(user => {
                if (user.roleType === 0) {
                    let newAdv = new questions(req.body);
                    newAdv.save(function (err, question) {
                        if (err) return res.send({
                            response: false,
                            value: err,
                        });
                        res.send({
                            response: true,
                            value: question,
                        })
                    })
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't admin, only admin insert, update, delete Question"
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

exports.update_question = function (req, res) {
    let {_id} = req.body;
    if (req.user.phone === undefined || _id === undefined) {
        return res.send({
            "response": false,
            "value": "user not found"
        });
    }
    users.find_user_phone(req.user.phone)
        .then(user => {
                if (user.roleType === 0) {
                    UpdateQuestion({_id}, req.body).then(
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
                                "value": "update Question fail"
                            });
                        }
                    )
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't admin, only admin insert, update, delete Question"
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


exports.delete_question = function (req, res) {
    let {_id} = req.body;
    if (req.user.phone === undefined || _id === undefined) {
        return res.send({
            "response": false,
            "value": "user not found"
        });
    }
    users.find_user_phone(req.user.phone)
        .then(user => {
                if (user.roleType === 0) {
                    DeleteOneQuestion({_id})
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
                                    "value": "err delete Question"
                                });
                            }
                        )
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't admin, only admin insert, update, delete Question"
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


exports.list_all_question = function (req, res) {
    FindAllQuestion({})
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

exports.list_question_active = function (req, res) {
    FindAllQuestion({status: 1})
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

