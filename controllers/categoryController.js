'use strict';
const category = require('../models/categoryModel'),
    user = require('../controllers/userController'),
    path = require('path'),
    multer = require('multer'),
    fsextra = require('fs-extra'),
    config = require('../config');

let FindOneCategories = (obj) => {
    return new Promise((resolve, reject) => {
        category.findOne(obj, function (err, cate) {
            if (err) return reject(err);
            resolve(cate);
        });
    });
};

let UpdateCategory = (condition, Obj) => {
    return new Promise((resolve, reject) => {
        category.findOneAndUpdate(condition, Obj, {new: true}, function (err, cate) {
            if (err) reject(err);
            resolve(cate);
        });
    });
};

//delete on Cat
let DeleteOneCat = (obj) => {
    return new Promise((resolve, reject) => {
        category.findOneAndRemove(obj, function (err, cat) {
            if (err) return reject(err);
            //remove icon old
            try {
                fsextra.remove(path.join(`${config.folder_uploads}`, `categories`, `${cat.icon}`));
                resolve(cat);
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
}).single('icon'); //Field name and max count

exports.insert_one = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.send({
                "response": false,
                "value": err
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
                            let newCat = new category(req.body);
                            newCat.icon = req.file.filename;
                            newCat.save(function (err, categories) {
                                if (err) return res.send({
                                    response: false,
                                    value: err,
                                });
                                fsextra.moveSync(
                                    path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                    path.join(`${config.folder_uploads}`, `categories`, `${req.file.filename}`),
                                    {overwrite: true});
                                res.send({
                                    response: true,
                                    value: categories,
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
        } else {
            return res.send({
                "response": false,
                "value": "save image fail"
            });
        }
    });

};

exports.update_cat = function (req, res) {
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
                    UpdateCategory({_id}, req.body).then(
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
                    "value": "loi tim user "
                });
            }
        )


};

exports.update_cat_image = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.send({
                "response": false,
                "value": err
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
                            obj.icon = req.file.filename;
                            FindOneCategories({_id})
                                .then(catf => {
                                    UpdateCategory({_id}, obj).then(
                                        catu => {
                                            if (catu) {
                                                //remove icon old
                                                try {
                                                    fsextra.remove(path.join(`${config.folder_uploads}`, `categories`, `${catf.icon}`));
                                                    console.log('success!')
                                                } catch (err) {
                                                    console.error(err)
                                                }
                                                fsextra.moveSync(
                                                    path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                                    path.join(`${config.folder_uploads}`, `categories`, `${req.file.filename}`),
                                                    {overwrite: true});
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
                                                "value": err
                                            });
                                        }
                                    )
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
        } else {
            return res.send({
                "response": false,
                "value": "save image fail"
            });
        }
    });

};

exports.delete_cat = function (req, res) {
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
                    DeleteOneCat({_id})
                        .then(catdel => {
                                if (catdel) {
                                    res.send({
                                        response: true,
                                        value: catdel,
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


exports.list_categories = function (req, res) {
    category.find({}, function (err, categories) {
        if (err) return res.send({
            response: false,
            value: err,
        });
        res.send({
            response: true,
            value: categories,
        })
    }).sort({label:1})
};

