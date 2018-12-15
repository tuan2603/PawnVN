'use strict';
const Testimonials = require('../models/testimonialModel');
const Users = require('../controllers/userController'),
    path = require('path'),
    multer = require('multer'),
    fsextra = require('fs-extra'),
    config = require('../config');

let CreateOneTestimonialObj = (obj) => {
    return new Promise((resolve, reject) => {
        let newTestimonials = new Testimonials(obj);
        newTestimonials.save(function (err, testimonal) {
            if (err) {
                return reject(err)
            }
            resolve(testimonal);
        })
    })
}

let FindAllTestimonialObj = (obj) => {
    return new Promise((resolve, reject) => {
        Testimonials.find(obj, function (err, testimonal) {
            if (err) {
                return reject(err)
            }
            resolve(testimonal);
        })
    })
}

let UpdateTestimonial = (conditon, obj) => {
    return new Promise((resolve, reject) => {
        Testimonials.findOneAndUpdate(conditon, obj, {new: true}, function (err, tm) {
            if (err) return reject(err);
            resolve(tm);
        });
    });
}

//delete one Testimonials
let DeleteOneTestimonial = (obj) => {
    return new Promise((resolve, reject) => {
        Testimonials.findOneAndRemove(obj, function (err, tm) {
            if (err) return reject(err);
            try {
                fsextra.remove(path.join(`${config.folder_uploads}`, `testimonials`, `${tm.avatarLink}`));
                resolve(tm);
            } catch (err) {
                return reject(err);
            }
        });
    });
};

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

exports.insert_testimonial = (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            return res.send({
                "response": false,
                "value": "upload file fail"
            });
        }
        if (!req.file) {
            return res.send({
                "response": false,
                "value": "upload file fail"
            });
        }

        let {content, full_name} = req.body;
        let {phone} = req.user;
        if (
            content === undefined ||
            phone === undefined ||
            full_name === undefined
        ) {
            return res.send({
                "response": false,
                "value": "not find params "
            });
        }
        Users.FindOneUserObj({phone})
            .then(userf => {
                    if (userf) {
                        if (userf.roleType !== 0) {
                            return res.send({
                                "response": false,
                                "value": "account not admin"
                            });
                        }
                        CreateOneTestimonialObj({content, full_name, avatarLink: req.file.filename})
                            .then(testimonial => {
                                    if (!testimonial) {
                                        return res.send({
                                            "response": false,
                                            "value": "not find user"
                                        });
                                    }

                                    fsextra.moveSync(
                                        path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                        path.join(`${config.folder_uploads}`, `testimonials`, `${req.file.filename}`),
                                        {overwrite: true});

                                    return res.send({
                                        "response": true,
                                        "value": testimonial
                                    });
                                },
                                err => {
                                    return res.send({
                                        "response": false,
                                        "value": "create testimonial"
                                    });
                                }
                            )
                    } else {
                        return res.send({
                            "response": false,
                            "value": "not find account admin"
                        });
                    }
                },
                err => {
                    return res.send({
                        "response": false,
                        "value": "not find account admin"
                    });
                }
            )
    })

}

// get all comment
exports.get_all_testimonials = (req, res) => {
    let {phone} = req.user;
    if (phone === undefined) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    Users.FindOneUserObj({phone})
        .then(userf => {
                if (userf) {
                    if (userf.roleType !== 0) {
                        return res.send({
                            "response": false,
                            "value": "user is not allowed to view this content"
                        });
                    }
                    FindAllTestimonialObj({})
                        .then(testimonals => {
                            if (testimonals.length === 0) {
                                return res.send({
                                    "response": false,
                                    "value": []
                                });
                            }
                            return res.send({
                                "response": true,
                                "value": testimonals
                            });
                        }, err => {
                            return res.send({
                                "response": false,
                                "value": "err find testimonals"
                            });
                        })
                } else {
                    return res.send({
                        "response": false,
                        "value": "token is not master onwe"
                    });
                }
            },
            err => {
                return res.send({
                    "response": false,
                    "value": err
                });
            }
        );
}

// get all comment da duyet
exports.get_all_testimonials_active = (req, res) => {
    FindAllTestimonialObj({status: 1})
        .then(testimonals => {
            if (testimonals.length > 0) {
                return res.send({
                    "response": true,
                    "value": testimonals
                });
            } else {
                return res.send({
                    "response": false,
                    "value": "không tìm thấy comments"
                });
            }
        }, err => {
            return res.send({
                "response": false,
                "value": "Lỗi tìm kiếm comments"
            });
        })
}

// update status comment
exports.update_testimonial = (req, res) => {
    let {_id} = req.body;
    let {phone} = req.user;
    if (phone === undefined || _id === undefined) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    let obj = {...req.body};
    // obj._id = undefined;
    Users.FindOneUserObj({phone})
        .then(userf => {
                if (userf) {
                    if (userf.roleType !== 0) {
                        return res.send({
                            "response": false,
                            "value": "user is not allowed to view this content"
                        });
                    }

                    UpdateTestimonial({_id}, obj)
                        .then(testimonal => {
                            if (!testimonal) {
                                return res.send({
                                    "response": false,
                                    "value": "update fail "
                                });
                            }
                            res.send({
                                "response": true,
                                "value": testimonal
                            });
                        }, err => {
                            return res.send({
                                "response": false,
                                "value": "update error"
                            });
                        });
                } else {
                    return res.send({
                        "response": false,
                        "value": "token is not master onwe"
                    });
                }
            },
            err => {
                return res.send({
                    "response": false,
                    "value": "not find user"
                });
            }
        );
}

// update testimonial iamge
exports.update_testimonial_image = (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            return res.send({
                "response": false,
                "value": "upload file fail"
            });
        }
        if (!req.file) {
            return res.send({
                "response": false,
                "value": "upload file fail"
            });
        }
        let {_id} = req.body;

        let {phone} = req.user;
        if (phone === undefined || _id === undefined) {
            return res.send({
                "response": false,
                "value": "not find params "
            });
        }
        let obj = {...req.body};
        obj.avatarLink = req.file.filename;
        Users.FindOneUserObj({phone})
            .then(userf => {
                    if (userf) {
                        if (userf.roleType !== 0) {
                            return res.send({
                                "response": false,
                                "value": "user is not allowed to view this content"
                            });
                        }
                        UpdateTestimonial({_id}, obj)
                            .then(testimonal => {
                                if (!testimonal) {
                                    return res.send({
                                        "response": false,
                                        "value": "not find user comment"
                                    });
                                }
                                //remove icon old
                                try {
                                    fsextra.remove(path.join(`${config.folder_uploads}`, `testimonials`, `${req.body.avatarLink}`));
                                    console.log('success!')
                                } catch (err) {
                                    console.error(err)
                                }
                                fsextra.moveSync(
                                    path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                    path.join(`${config.folder_uploads}`, `testimonials`, `${req.file.filename}`),
                                    {overwrite: true});
                                res.send({
                                    "response": true,
                                    "value": testimonal
                                });
                            }, err => {
                                return res.send({
                                    "response": false,
                                    "value": "update error"
                                });
                            });
                    } else {
                        return res.send({
                            "response": false,
                            "value": "token is not master onwe"
                        });
                    }
                },
                err => {
                    return res.send({
                        "response": false,
                        "value": "not find user"
                    });
                }
            );
    })


}

// delete comment
exports.delete_testimonial = (req, res) => {
    let {_id} = req.body;
    let {phone} = req.user;
    if (phone === undefined || _id === undefined) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }

    Users.FindOneUserObj({phone})
        .then(userf => {
                if (userf) {
                    if (userf.roleType !== 0) {
                        return res.send({
                            "response": false,
                            "value": "user is not allowed to view this content"
                        });
                    }
                    DeleteOneTestimonial({_id})
                        .then(testimonal => {
                            if (!testimonal) return res.send({
                                "response": false,
                                "value": "not find user comment"
                            });
                            res.send({
                                "response": true,
                                "value": testimonal
                            });
                        }, err => {
                            return res.send({
                                "response": false,
                                "value": "not find user comment"
                            });
                        });
                } else {
                    return res.send({
                        "response": false,
                        "value": "token is not master onwe"
                    });
                }
            },
            err => {
                return res.send({
                    "response": false,
                    "value": "not find user"
                });
            }
        );
}