'use strict';
const advertise = require('../models/advertiseModel'),
    user = require('../controllers/userController'),
    path = require('path'),
    multer = require('multer'),
    fsextra = require('fs-extra'),
    config = require('../config');

let FindOneAdvertise = (obj) => {
    return new Promise((resolve, reject) => {
        advertise.findOne(obj, function (err, adv) {
            if (err) return reject(err);
            resolve(adv);
        });
    });
};

let FindAllAdvertise = (obj) => {
    return new Promise((resolve, reject) => {
        advertise.find(obj, function (err, adv) {
            if (err) return reject(err);
            resolve(adv);
        }).sort({status: 1, create_at: 1});
    });
};

let UpdateAdvertise = (condition, Obj) => {
    return new Promise((resolve, reject) => {
        advertise.findOneAndUpdate(condition, Obj, {new: true}, function (err, adv) {
            if (err) reject(err);
            resolve(adv);
        });
    });
};

//delete on Advertise
let DeleteOneAdvertise = (obj) => {
    return new Promise((resolve, reject) => {
        advertise.findOneAndRemove(obj, function (err, adv) {
            if (err) return reject(err);
            //remove icon old
            try {
                fsextra.remove(path.join(`${config.folder_uploads}`, `advertises`, `${adv.url_image}`));
                resolve(adv);
            } catch (err) {
                return reject(err);
            }
        });
    });
}

let uploadDir = config.folder_temp;
let Storage = multer.diskStorage({
    destination: uploadDir,
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + ".jpg");
    }
});

/*
*  function upload ảnh kiểm tra ảnh định dạng đuôi có phải là png, jpg, hay jpeg
*  dung lượng tối đa cho phép là 6 mb
* */

let upload = multer({
    storage: Storage,
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.png'
            && ext !== '.jpg'
            && ext !== '.jpeg'
        ) {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 6000000
    }
}).single('file'); //Field name and max count

exports.insert_one = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.send({
                "response": false,
                "value": "upload file fail"
            });
        }
        if (req.file) {
            if (req.user.phone === undefined) {
                return res.send({
                    "response": false,
                    "value": "user not found"
                });
            }
            user.find_user_phone(req.user.phone)
                .then(user => {
                        if (user.roleType === 0) {
                            let newAdv = new advertise(req.body);
                            newAdv.url_image = req.file.filename;
                            newAdv.save(function (err, adves) {
                                if (err) return res.send({
                                    response: false,
                                    value: err,
                                });
                                fsextra.moveSync(
                                    path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                    path.join(`${config.folder_uploads}`, `advertises`, `${req.file.filename}`),
                                    {overwrite: true});
                                res.send({
                                    response: true,
                                    value: adves,
                                })
                            })
                        } else {
                            return res.send({
                                "response": false,
                                "value": "user isn't admin, only admin insert, update, delete Advertise"
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
        } else {
            return res.send({
                "response": false,
                "value": "save image fail"
            });
        }
    });

};

exports.update_advertises = function (req, res) {
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
                    UpdateAdvertise({_id}, req.body).then(
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
                                "value": "update advertise fail"
                            });
                        }
                    )
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't admin, only admin insert, update, delete Advertise"
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

exports.update_advertise_image = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.send({
                "response": false,
                "value": "error save image"
            });
        }
        if (req.file) {
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
                            let obj = req.body;
                            obj.url_image = req.file.filename;
                            FindOneAdvertise({_id})
                                .then(advf => {
                                    UpdateAdvertise({_id}, obj).then(
                                        advup => {
                                            if (advup) {
                                                //remove icon old
                                                try {
                                                    fsextra.remove(path.join(`${config.folder_uploads}`, `advertises`, `${advf.icon}`));
                                                    console.log('success!')
                                                } catch (err) {
                                                    console.error(err)
                                                }
                                                fsextra.moveSync(
                                                    path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                                    path.join(`${config.folder_uploads}`, `advertises`, `${req.file.filename}`),
                                                    {overwrite: true});
                                                res.send({
                                                    response: true,
                                                    value: advup,
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
                                                "value": "update info advertises"
                                            });
                                        }
                                    )
                                }, err => {
                                    return res.send({
                                        "response": false,
                                        "value": " find advertise fail"
                                    });
                                })

                        } else {
                            return res.send({
                                "response": false,
                                "value": "user isn't admin, only admin insert, update, delete Advertise"
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
        } else {
            return res.send({
                "response": false,
                "value": "save image fail"
            });
        }
    });

};

exports.delete_adver = function (req, res) {
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
                    DeleteOneAdvertise({_id})
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
                                    "value": "err delete advertises"
                                });
                            }
                        )
                } else {
                    return res.send({
                        "response": false,
                        "value": "user isn't admin, only admin insert, update, delete Advertise"
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


exports.list_all_advertise = function (req, res) {
    FindAllAdvertise({})
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

exports.list_advertise_active = function (req, res) {
    FindAllAdvertise({status: 1})
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

