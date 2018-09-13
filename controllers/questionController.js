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
        }).sort({no:1,question_group:1});
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
    let {  question_group,
        title_question, no} = req.body;
    if (
        req.user.phone === undefined
        || question_group === undefined
        || title_question === undefined
        || no === undefined
    ) {
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
                    "value": "user not found"
                });
            })
};

exports.insert_answer = function (req, res) {
    let {_id, answer} = req.body;
    if (req.user.phone === undefined || _id === undefined) {
        return res.send({
            "response": false,
            "value": "user not found"
        });
    }
    users.find_user_phone(req.user.phone)
        .then(user => {
                if (user.roleType === 0) {
                    FindOneQuestion({_id})
                        .then(questionf => {
                            if (questionf) {
                                questionf.content_answer.push({answer});
                                questionf.save(function (err, question) {
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
                                    "value": "find question fail"
                                });
                            }
                        },
                        err => {
                            return res.send({
                                "response": false,
                                "value": "find question fail"
                            });
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
                    "value": "user not found"
                });
            })
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
                                    "value": "update question false"
                                });
                            }
                        }, err => {
                            return res.send({
                                "response": false,
                                "value": "update question fail"
                            });
                        }
                    )
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't admin, only admin insert, update, delete question"
                    });
                }
            },
            err => {
                return res.send({
                    "response": false,
                    "value": "not found user "
                });
            }
        )
};

exports.update_answer= function (req, res) {
    let {_id, answer} = req.body;
    if (req.user.phone === undefined || _id === undefined || answer === undefined) {
        return res.send({
            "response": false,
            "value": "user not found"
        });
    }
    users.find_user_phone(req.user.phone)
        .then(user => {
                if (user.roleType === 0) {
                    let questionf = questions.content_answer.id(_id);
                    questionf.content_answer.id(_id).remove();
                    questionf.content_answer.push({answer});
                    questionf.save(function (err, question) {
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
                        "value": "user isn't admin, only admin insert, update, delete question"
                    });
                }
            },
            err => {
                return res.send({
                    "response": false,
                    "value": "not found user "
                });
            }
        )
};

exports.delete_answer= function (req, res) {
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
                    var questionf = questions.content_answer.id(_id);
                    questionf.content_answer.id(_id).remove();
                    questionf.save(function (err, question) {
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
                        "value": "user isn't admin, only admin insert, update, delete question"
                    });
                }
            },
            err => {
                return res.send({
                    "response": false,
                    "value": "not found user "
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
                                        "value": "delete question false"
                                    });
                                }
                            }, err => {
                                return res.send({
                                    "response": false,
                                    "value": "err delete question"
                                });
                            }
                        )
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't admin, only admin insert, update, delete question"
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

