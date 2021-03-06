'use strict';
const mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    Async = require('async'),
    saltRounds = 10,
    jwt = require('jsonwebtoken'),
    User = mongoose.model('User'),
    Code = mongoose.model('VerifyCode'),
    config = require("../config"),
    codecrt = require("../controllers/codeController"),
    {createWallets, DeleteOneWallet} = require("../controllers/walletsController"),
    {DeleteAllPawnForUser} = require("../controllers/pawnController"),
    passwordValidator = require('password-validator'),
    path = require('path'),
    multer = require('multer'),
    fs = require('fs'),
    fsextra = require('fs-extra'),
// Create a schema
    checkPass = new passwordValidator(),
    nodemailer = require('nodemailer'),
    rp = require('request-promise');
// Add properties to it
checkPass
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                 // Must have digits
    .has().symbols()                                 // Must have symbols
    .has().not().spaces();                           // Should not have spaces
//.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

// completely pointless, but whatever
const rn = require('random-number');
const options = {
    min: 1000,
    max: 9999
    , integer: true
};

const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: config.API_KEY,
    apiSecret: config.API_SECRET,
}, {debug: true});

let Send_mail = async (mail, Verification) => {

    let transporter = await nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mailfortest32018@gmail.com',
            pass: 'TrinhVM@1'
        }
    });

    await console.log("email " + mail);

    let mailOptions = await {
        from: 'mailfortest32018@gmail.com',
        to: mail,
        subject: 'Account Verification',
        text: 'Your confirmation code: ' + Verification,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return false
        } else {
            return true
        }
    });

}
//delete on user
let DeleteOneUser = (obj) => {
    return new Promise((resolve, reject) => {
        User.findOneAndRemove(obj, function (err, userdl) {
            if (err) return reject(err);
            fsextra.removeSync(`public/uploads/${userdl.phone}`);
            resolve(userdl);
        });
    });
}

let UpdateUserSocketID = (obj) => {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({socket_id: obj.socket_id}, obj, {new: true}, function (err, User) {
            if (err) return reject(err);
            resolve(User);
        });
    });
}
let UpdateUser = (condition, obj) => {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate(condition, obj, {new: true}, function (err, User) {
            if (err) return reject(err);
            resolve(User);
        });
    });
}

let comparePassword = function (password, user) {
    return bcrypt.compareSync(password, user.password);
}


let findManyUserObj = (obj) => {
    return new Promise((resolve, reject) => {
        User.find(obj, function (err, users) {
            if (err) reject(err);
            resolve(users);
        });
    });
}

let FindOneUserObj = (obj) => {
    return new Promise((resolve, reject) => {
        User.findOne(obj, function (err, users) {
            if (err) reject(err);
            resolve(users);
        });
    });
}


let FindUserSocketID = (obj) => {
    return new Promise((resolve, reject) => {
        User.findOne({socket_id: socket_id, _id: obj._id}, function (err, User) {
            if (err) return reject(err);
            resolve(User);
        });
    });
}


let findUserPhone = (phone) => {
    return new Promise((resolve, reject) => {
        User.findOne({phone: phone}, function (err, user) {
            if (err) reject(err);
            resolve(user);
        });
    });
};


let findUserId = (id) => {
    return new Promise((resolve, reject) => {
        User.findOne({_id: id}, function (err, user) {
            if (err) reject(err);
            resolve(user);
        });
    });
}

let findAllUser = () => {
    return new Promise((resolve, reject) => {
        User.find({}, function (err, user) {
            if (err) reject(err);
            resolve(user);
        });
    });
}


let findAllBusiness = () => {
    return new Promise((resolve, reject) => {
        User.find({roleType: 2}, function (err, user) {
            if (err) reject(err);
            resolve(user);
        });
    });
}

let UpdateUserID = (obj) => {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({_id: obj._id}, obj, {new: true}, function (err, User) {
            if (err) return reject(err);
            User.password = undefined;
            resolve(User);
        });
    });
}

let UpdateUserObj = (condition, updateinfo) => {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate(condition, updateinfo, {new: true}, function (err, User) {
            if (err) return reject(err);
            resolve(User);
        });
    });
}

let SaveCoseVerify = (newCode) => {
    newCode.save(function (err, user) {
        if (err) console.log(err);
    });
};

let SingIN = (user, res) => {
    let Verification = rn(options);
    let newCode = new Code({
        accountId: user._id,
        phone: user.phone,
        code: Verification,
    });
    if (user.verifyType === 0) {
        // veify code mail
        if (Send_mail(user.email, Verification)) {
            SaveCoseVerify(newCode);
            return res.send({
                value: 6,
                message: Messages,
                code: Verification
            });
        } else {
            return res.send({
                value: 1,
                "message": Messages
            });
        }
    } else if (user.verifyType === 1) {
        //verify code sen message
        SaveCoseVerify(newCode);
        return res.send({
            value: 7,
            message: Messages,
            code: Verification
        });
    } else {
        return res.send({
            value: 8,
            message: Messages
        });
    }
}
let Messages = {
    1: "Send mail or message code vefrify fail",
    2: "Register user fail",
    3: "Register user error",
    4: "Find user fail",
    5: "User exits but not active",
    6: "Check mail code verify",
    7: "Check message code verify",
    8: "Type password to sign in",
    9: "Email exists",
    10: "phone undefined",
    11: "Error find code",
    12: "Check the phone number, send code more than 5 times will be blocked",
};
// gui lai code
exports.send_code_again = function (req, res) {
    //lưu thông tin người dùng bảng chính
    let {phone} = req.body;
    if (phone === undefined) {
        return res.send({
            message: Messages,
            value: 10,
        });
    }
    codecrt.findAllFollowPhone(Number(phone)).then(
        codes => {
            if (codes.length > 5) {
                return res.send({
                    message: Messages,
                    value: 12,
                });
            }
            findUserPhone(Number(phone))
                .then(
                    user => {
                        if (user) {
                            return SingIN(user, res);
                        } else {
                            return res.send({
                                message: Messages,
                                value: 4
                            });
                        }
                    },
                    err => {
                        return res.send({
                            message: Messages,
                            value: 4
                        });
                    });
        },
        err => {
            return res.send({
                message: Messages,
                value: 11,
            });
        }
    );

}
let mesVerify = {
    1: 'Authentication failed. User not found.',
    2: 'Authentication failed. code not right.',
    3: 'Authentication failed. paramas not enought.',
    4: 'Authentication failed. User not active.',
    5: 'Authentication failed. password not right.',
};
let findCode = (id) => {
    return new Promise((resolve, reject) => {
        Code.find({
            accountId: id
        }, function (err, code) {
            //console.log(code);
            if (err) reject(err);
            resolve(code[0]);
        })
            .sort({
                create_at: -1
            })
            .limit(1)
    });
}
exports.verify = function (req, res) {
    let {verifyType, code, phone, roleType} = req.body;
    if (
        verifyType === undefined || code === undefined ||
        phone === undefined || roleType === undefined
    ) {
        return res.json({
            value: 3,
            message: mesVerify
        })
    }
    FindOneUserObj({phone, roleType, verifyType})
        .then(userf => {
                if (!userf) {
                    return res.json({
                        value: 1,
                        message: mesVerify
                    })
                }
                findCode(userf._id)
                    .then(
                        codes => {
                            if (codes) {
                                if (codes.code === code) {
                                    //xóa code đã active
                                    Code.deleteMany({
                                        phone: userf.phone
                                    }, function (err, re) {
                                        if (err) console.log(err);
                                    })

                                    if (userf.activeType === 0) {
                                        User.findOneAndUpdate(
                                            {_id: userf._id},
                                            {activeType: 1}, {new: true}, function (err, useOne) {
                                                console.log(err);
                                            })
                                    }
                                    userf.password = undefined;
                                    return res.send({
                                        message: jwt.sign({
                                            phone: userf.phone,
                                            create_at: userf.create_at,
                                            fullName: userf.fullName,
                                            _id: userf._id
                                        }, config.secret),
                                        value: 0,
                                        id: userf._id,
                                        roleType: userf.roleType,
                                    });
                                } else {
                                    return res.send({
                                        value: 2,
                                        message: mesVerify
                                    })
                                }
                            }
                            else {
                                return res.send({
                                    value: 2,
                                    message: mesVerify
                                })
                            }
                        },
                        err => {
                            return res.json({
                                value: 2,
                                message: mesVerify
                            })
                        }
                    )
            },
            err => {
                return res.json({
                    value: 1,
                    message: mesVerify
                })
            });

}

//function dung để đăng ký bằng web
//dùng để đăng nhập bằng mật khẩu
//roleType: 2, // 1 user, 2 driver, 0 admin
//verifyType: 2, // 0: mail, 1 phone, 2 password
//kiểm tra nếu email và phone tồn tại sẽ không cho đăng ký
exports.register_old = function (req, res) {
    if (req.body.phone === undefined ||
        req.body.password === undefined ||
        req.body.countryCode === undefined ||
        req.body.fullName === undefined) {
        return res.send({
            message: 'Truyền thiếu biến',
            value: 5
        });
    }
    if (!checkPass.validate(req.body.password)) {
        return res.send({
            value: 1,
            message: 'Minimum length 8, ' +
                'Maximum length 100, ' +
                'Must have uppercase letters, ' +
                'Must have lowercase letters, ' +
                'Must have digits, ' +
                'Must have symbols, ' +
                'Should not have spaces'
        });
    }
    findUserPhone(req.body.phone)
        .then(
            userphone => {
                if (!userphone) {
                    let newUser = new User(req.body);
                    newUser.verifyType = 1;
                    newUser.roleType = 2;
                    newUser.password = bcrypt.hashSync(req.body.password, saltRounds);
                    newUser.save(function (err, users) {
                        if (err) {
                            console.log(err);
                            return res.send({
                                message: 'Lối đăng ký',
                                value: 4
                            });
                        } else {
                            if (users) {
                                let Verification = rn(options);
                                let newCode = new Code({
                                    accountId: users._id,
                                    phone: users.phone,
                                    code: Verification,
                                });
                                SaveCoseVerify(newCode);
                                //tạo giỏ tiền khi đăng ký thành công
                                createWallets({
                                    accountID: users._id,
                                    phone: users.phone,
                                }).then(
                                    res => {
                                        console.log("create wallet success");
                                    },
                                    err => {
                                        console.log("create wallet fail");
                                    }
                                );
                                return res.send({
                                    message: 'Đăng ký thành công',
                                    value: 0,
                                    code: Verification
                                });
                            }
                            else {
                                return res.send({
                                    message: 'Lối đăng ký',
                                    value: 4,
                                });
                            }
                        }
                    });
                } else {
                    return res.send({
                        message: 'Số điện thoại đã tồn tại',
                        value: 3
                    });
                }
            },
            err => {
                return res.send({
                    message: 'Số điện thoại đã tồn tại',
                    value: 3
                });
            }
        );
}

exports.register_user_pass = function (req, res) {
    if (req.body.phone === undefined ||
        req.body.password === undefined ||
        req.body.countryCode === undefined ||
        req.body.fullName === undefined) {
        return res.send({
            message: 'Truyền thiếu biến',
            value: 5
        });
    }
    if (!checkPass.validate(req.body.password)) {
        return res.send({
            value: 1,
            message: 'Minimum length 8, ' +
                'Maximum length 100, ' +
                'Must have uppercase letters, ' +
                'Must have lowercase letters, ' +
                'Must have digits, ' +
                'Must have symbols, ' +
                'Should not have spaces'
        });
    }
    findUserPhone(req.body.phone)
        .then(
            userphone => {
                if (!userphone) {
                    let newUser = new User(req.body);
                    newUser.verifyType = 1;
                    newUser.roleType = 1;
                    newUser.password = bcrypt.hashSync(req.body.password, saltRounds);
                    newUser.save(function (err, user) {
                        if (err) {
                            console.log(err);
                            return res.send({
                                message: 'Lối đăng ký',
                                value: 4
                            });
                        } else {
                            if (user) {
                                let Verification = rn(options);
                                let newCode = new Code({
                                    accountId: user._id,
                                    phone: user.phone,
                                    code: Verification,
                                });
                                SaveCoseVerify(newCode);

                                //tạo giỏ tiền khi đăng ký thành công
                                createWallets({
                                    accountID: user._id,
                                    phone: user.phone,
                                }).then(
                                    res => {
                                        console.log("create wallet success");
                                    },
                                    err => {
                                        console.log("create wallet fail");
                                    }
                                );
                                return res.send({
                                    message: 'Đăng ký thành công',
                                    value: 0,
                                    code: Verification
                                });

                            }
                            else {
                                return res.send({
                                    message: 'Lối đăng ký',
                                    value: 4,
                                });
                            }
                        }
                    });
                } else {
                    return res.send({
                        message: 'Số điện thoại đã tồn tại',
                        value: 3
                    });
                }
            },
            err => {
                return res.send({
                    message: 'Số điện thoại đã tồn tại',
                    value: 3
                });
            }
        );
}

exports.update_active = function (req, res) {
    User.findOneAndUpdate({email: req.params.email}, req.body, {new: true}, function (err, User) {
        if (err)
            return res.status(400).send({
                response: 'Update fail',
                value: false
            });
        User.password = undefined;
        res.json({
            value: true,
            response: User
        });
    });
}

exports.profile = function (req, res) {
    User.findOne({_id: req.params.id}, function (err, User) {
        if (err) {
            return res.send({
                response: 'get profile fail',
                value: false
            });
        } else {
            if (User) {
                User.password = undefined;
                res.send({
                    value: true,
                    response: User
                });
            } else {
                return res.send({
                    response: 'get profile fail',
                    value: false
                });
            }
        }
    });
}

exports.update_profile = function (req, res) {
    User.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, function (err, User) {
        if (err)
            return res.send({
                response: 'Update fail',
                value: false
            });
        User.password = undefined;
        res.json({
            value: true,
            response: User
        });
    });
}

exports.update_password = function (req, res) {
    let {password, id} = req.body;
    if (password === undefined || id === undefined) {
        return res.send({
            value: 'not found params',
            response: false
        });
    }
    if (!checkPass.validate(password)) {
        return res.send({
            value: 'Minimum length 8, ' +
                'Maximum length 100, ' +
                'Must have uppercase letters, ' +
                'Must have lowercase letters, ' +
                'Must have digits, ' +
                'Must have symbols, ' +
                'Should not have spaces',
            response: false,
        });
    }
    let passwordh = bcrypt.hashSync(password, saltRounds);
    User.findOneAndUpdate({_id: id}, {
        password: passwordh
    }, {new: true}, function (err, User) {
        if (err)
            return res.send({
                value: 'Update fail',
                response: false
            });
        User.password = undefined;
        res.json({
            response: true,
            value: User
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
}).single('avatar'); //Field name and max count

exports.update_avatar = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.send({
                "response": false,
                "value": err,
            });
        }
        //console.log(req.file);
        if (!req.file) {
            return res.send({
                "response": false,
                "value": "not find image"
            });
        }
        let {id} = req.body;
        if (id === undefined) {
            return res.send({
                "response": false,
                "value": "not find params id user"
            });
        }
        findUserId(id)
            .then(
                userf => {
                    if (userf) {
                        // update and move avatar from folder tepms to folder user( phone number)
                        UpdateUserID({_id: id, avatarLink: req.file.filename})
                            .then(useru => {
                                fsextra.moveSync(
                                    path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                    path.join(`${config.folder_uploads}`, `${useru.phone}`, `${req.file.filename}`),
                                    {overwrite: true});
                                FindAllInfoUser({_id: id})
                                    .then(userrp => {
                                            return res.send({
                                                value: userrp,
                                                response: true
                                            });
                                        },
                                        err => {
                                            return res.send({
                                                "response": false,
                                                "value": err
                                            });
                                        }
                                    );
                            }, err => {
                                return res.send({
                                    "response": false,
                                    "value": err
                                });
                            })

                    } else {
                        return res.send({
                            "response": false,
                            "value": "not find user"
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
    });
};

let FindAllInfoUser = (obj) => {
    return new Promise((resolve, reject) => {
        User.findOne({_id: obj._id}, function (err, userf) {
            if (err) return reject(err);
            resolve(userf);
        });
    });
}
// dung để
// update thông tin user
exports.update_userboth = (req, res) => {
    let {id} = req.body;
    let {phone} = req.user;
    console.log(req.body);
    if (id === undefined || phone === undefined) {
        return res.send({
            "response": false,
            "value": "not found id",
        });
    }
    UpdateUserObj({_id: id, phone}, req.body)
        .then(
            useru => {
                if (useru) {
                    res.send({
                        "response": true,
                        "value": useru,
                    });
                } else {
                    res.send({
                        "response": false,
                        "value": "update fail",
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


exports.update_identityCardFront = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.send({
                "response": false,
                "value": err
            });
        }
        //console.log(req.file);
        if (!req.file) {
            return res.send({
                "response": false,
                "value": "not find image"
            });
        }

        if (req.body.id === undefined || req.body.expression === undefined || req.user.phone === undefined) {
            return res.send({
                "response": false,
                "value": "not find params id user"
            });
        }

        FindOneUserObj({_id: req.body.id, phone: req.user.phone})
            .then(
                userf => {
                    if (!userf) {
                        return res.json({
                            "response": false,
                            "value": "not find user"
                        });
                    }
                    switch (req.body.expression) {
                        case 'identityCardFront':
                            // update and move avatar from folder tepms to folder user( phone number)
                            UpdateUserObj({_id: req.body.id}, {identityCardFront: req.file.filename})
                                .then(useru => {
                                    fsextra.moveSync(
                                        path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                        path.join(`${config.folder_uploads}`, `${userf.phone}`, `${req.file.filename}`),
                                        {overwrite: true});
                                    return res.send({
                                        value: useru,
                                        response: true
                                    });
                                }, err => {
                                    return res.json({
                                        "response": false,
                                        "value": err
                                    });
                                });
                            break;
                        case 'identityCardBehind':
                            // update and move avatar from folder tepms to folder user( phone number)
                            UpdateUserObj({_id: req.body.id}, {identityCardBehind: req.file.filename})
                                .then(useru => {
                                    fsextra.moveSync(
                                        path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                        path.join(`${config.folder_uploads}`, `${userf.phone}`, `${req.file.filename}`),
                                        {overwrite: true});
                                    return res.send({
                                        value: useru,
                                        response: true
                                    });
                                }, err => {
                                    return res.json({
                                        "response": false,
                                        "value": err
                                    });
                                });
                            break;
                        case 'licenseeImageFront':
                            // update and move avatar from folder tepms to folder user( phone number)
                            UpdateUserObj({_id: req.body.id}, {licenseeImageFront: req.file.filename})
                                .then(useru => {
                                    fsextra.moveSync(
                                        path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                        path.join(`${config.folder_uploads}`, `${userf.phone}`, `${req.file.filename}`),
                                        {overwrite: true});
                                    return res.send({
                                        value: useru,
                                        response: true
                                    });
                                }, err => {
                                    return res.json({
                                        "response": false,
                                        "value": err
                                    });
                                });
                            break;
                        case 'licenseeImageBehind':

                            // update and move avatar from folder tepms to folder user( phone number)
                            UpdateUserObj({_id: req.body.id}, {licenseeImageBehind: req.file.filename})
                                .then(useru => {
                                    fsextra.moveSync(
                                        path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                        path.join(`${config.folder_uploads}`, `${userf.phone}`, `${req.file.filename}`),
                                        {overwrite: true});
                                    return res.send({
                                        value: useru,
                                        response: true
                                    });
                                }, err => {
                                    return res.json({
                                        "response": false,
                                        "value": err
                                    });
                                });
                            break;
                        default:
                            return res.json({
                                "response": false,
                                "value": "không tim thấy"
                            });
                    }
                },
                err => {
                    return res.json({
                        "response": false,
                        "value": err
                    });
                }
            );
    });
}

exports.sign_in = function (req, res) {
    if (req.body.phone === undefined ||
        req.body.password === undefined) {
        return res.send({
            message: 'Truyền thiếu biến',
            value: 6
        });
    }
    User.findOne({
        phone: req.body.phone
    }, function (err, user) {
        if (err) {
            return res.send({
                message: 'Lỗi tìm user',
                value: 5,
            })
        }
        if (!user) {
            return res.send({
                message: 'Tài khoản không tồn tại',
                value: 2,
            })
        }
        if (!comparePassword(req.body.password, user)) {
            return res.json({
                message: 'Mật khẩu không đúng.',
                value: 3,
            })
        }
        if (user.activeType < 1) {
            return res.send({
                message: 'Tài khoản chưa được xác thực',
                value: 1,
            })
        }
        res.send({
            message: jwt.sign({
                phone: user.phone,
                create_at: user.create_at,
                fullName: user.fullName,
                _id: user._id
            }, config.secret),
            value: 0,
            id: user._id,
            roleType: user.roleType,
        });
    })
}
exports.sign_in_admin = function (req, res) {
    if (req.body.phone === undefined ||
        req.body.password === undefined) {
        return res.send({
            value: 'not find params',
            response: false
        });
    }
    User.findOne({
        phone: req.body.phone
    }, function (err, user) {
        if (err) {
            return res.send({
                value: err,
                response: false
            });
        }

        if (!user) {
            return res.send({
                value: "user not found",
                response: false
            });
        }


        if (!comparePassword(req.body.password, user)) {
            return res.send({
                value: "wrong password",
                response: false
            })
        }

        if (user.activeType < 1) {
            return res.send({
                value: 'account not active',
                response: false,
            })
        }

        if (user.roleType !== 0) {
            return res.send({
                value: 'account not admin',
                response: false,
            })
        }
        res.send({
            value: jwt.sign({
                phone: user.phone,
                fullName: user.fullName,
                _id: user._id
            }, config.secret),
            response: true,
            roleType: user.roleType,
        });
    })
}
//kiem tra đang nhập qua session
exports.get_info = function (req, res) {
    let {phone} = req.user;
    if (!phone) {
        return res.send({
            value: "not  find info user",
            response: false
        })
    }

    findUserPhone(phone)
        .then(userf => {
            if (userf) {
                userf.activeType = undefined;
                userf.password = undefined;
                userf.verifyType = undefined;
                return res.send({
                    value: userf,
                    response: true
                })
            } else {
                return res.send({
                    value: "not  find info user",
                    response: false
                })
            }
        }, err => {
            return res.send({
                value: err,
                response: false
            })
        })
}
exports.loginRequired = function (req, res, next) {
    if (req.user) {
        next();
    } else {
        return res.status(401).json({message: 'Unauthorized user!'});
    }
};

exports.get_all_business = function (req, res) {
    findAllBusiness()
        .then(users => {
            return res.json({
                response: true,
                value: users,
            })
        }, err => {
            return res.json({
                response: false,
                value: err,
            })
        })
};
//get all user not follow
exports.get_all_user_business_follow = function (req, res) {
    findManyUserObj({roleType: 2, accept: false})
        .then(users => {
            return res.json({
                response: true,
                value: users,
            })
        }, err => {
            return res.json({
                response: false,
                value: err,
            })
        })
};

exports.get_all_user_business_following = function (req, res) {
    findManyUserObj({roleType: 2, accept: true})
        .then(users => {
            return res.json({
                response: true,
                value: users,
            })
        }, err => {
            return res.json({
                response: false,
                value: err,
            })
        })
};

//delte user and delete all table have relationship
let DeleteUser = (obj) => {
    return new Promise((resolve, reject) => {
        findUserId(obj._id)
            .then(
                userdl => {
                    //console.log(userdl);
                    if (userdl) {
                        if (userdl.length > 0) {
                            // không tồn tại hoặc là admin không được xóa
                            reject("không xóa được, không tồn tại hoặc là admin");
                        }

                        if (userdl.roleType === 1) {
                            // = 1 là người dùng
                            // tìm tất cả các pawn của người dùng để xóa

                            DeleteAllPawnForUser(obj);
                            resolve(userdl);
                        }

                        if (userdl.roleType === 2) {
                            // = 2 là bussiness
                            resolve(userdl);
                        }
                    } else {
                        // không tồn tại hoặc là admin không được xóa
                        reject("không xóa được, không tồn tại hoặc là admin");
                    }

                },
                err => {
                    reject(err);
                }
            )
    });
};

exports.delete_one_user_by_id = (req, res) => {
    if (req.body._id === undefined) {
        return res.json({
            response: false,
            value: "not find params id user"
        })
    }
    DeleteUser(req.body)
        .then(
            userdl => {
                if (userdl) {
                    return res.json({
                        response: true,
                        value: userdl
                    })
                } else {
                    return res.json({
                        response: false,
                        value: "delete fail",
                    })
                }
            },
            err => {
                return res.json({
                    response: false,
                    value: err,
                })
            }
        )
}

// inser new comments for user
exports.insert_comment = (req, res) => {
    let {_id, rating_star, body} = req.body;
    let {phone} = req.user;
    if (_id === undefined ||
        rating_star === undefined ||
        body === undefined ||
        phone === undefined) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    FindOneUserObj({phone})
        .then(userf => {
                if (userf) {
                    FindOneUserObj({_id})
                        .then(ownerf => {
                                if (ownerf) {
                                    ownerf.comments.push({accountID: userf._id,phone:userf.phone,fullName:userf.fullName,sex:userf.sex,avatarLink:userf.avatarLink, rating_star, body});
                                    ownerf.save(function (err, userud) {
                                        if (err) return res.send({
                                            "response": false,
                                            "value": err
                                        });
                                        return res.send({
                                            "response": true,
                                            "value": userud
                                        });
                                    });
                                } else {
                                    return res.send({
                                        "response": false,
                                        "value": "not find user"
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
        )
}

// get all comment
exports.get_all_comment = (req, res) => {
    let {phone} = req.user;
    if (phone === undefined) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    FindOneUserObj({phone})
        .then(userf => {
                if (userf) {
                    if (userf.roleType !== 0) {
                        return res.send({
                            "response": false,
                            "value": "user is not allowed to view this content"
                        });
                    }
                    findManyUserObj({"comments": {$ne: null}})
                        .then(userfcomment => {
                            let comments = [];
                            Async.forEachOf(userfcomment, function (usercm, key, callback) {
                                comments.push(...usercm.comments);
                                callback();
                            }, function (err) {
                                if (err) return res.send({
                                    "response": false,
                                    "value": err
                                });
                                res.send({
                                    "response": true,
                                    "value": comments,
                                });
                            });

                        }, err => {
                            console.log(err);
                            return res.send({
                                "response": false,
                                "value": "err find comments"
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

let FindCommentStatus = () => {
  return new  Promise((resolve, reject) => {
        findManyUserObj({"comments": {$ne: null}})
            .then(userfcomment => {
                let comments = [];
                Async.forEachOf(userfcomment, function (usercm, key, callback) {
                    comments.push(...usercm.comments);
                    callback();
                }, function (err) {
                    if (err) return reject(err);
                    let comstatus = [];
                    Async.forEachOf(comments, function (comment, key, callback) {
                        if (comment.status === 1) {
                            comstatus.push(comment);
                        }
                        callback();
                    }, function (err) {
                        if (err) return reject(err);
                        resolve(comstatus);
                    });
                });
            }, err => {
                reject(err);
            })
    });
}

// get all comment da duyet
exports.get_all_comment_status = (req, res) => {
    let { page, limit } = req.params;
    if (page === undefined || limit === undefined) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    FindCommentStatus()
        .then(commets => {
            if (commets.length > 0) {
                return res.send({
                    "response": true,
                    "value": commets.slice((0 + page - 1) * limit, page * limit),
                    "pages": Math.round(commets.length/limit*1+0.5),
                });
            } else {
                return res.send({
                    "response": false,
                    "value": "không tìm thấy comments"
                });
            }
        }, err => {
            console.log(err);
            return res.send({
                "response": false,
                "value": "Lỗi tìm kiếm comments"
            });
        })
}

// update status comment
exports.update_comment_status = (req, res) => {
    let {_id} = req.body;
    let {phone} = req.user;
    if (phone === undefined  || _id === undefined) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    FindOneUserObj({phone})
        .then(userf => {
                if (userf) {
                    if (userf.roleType !== 0) {
                        return res.send({
                            "response": false,
                            "value": "user is not allowed to view this content"
                        });
                    }
                    User.findOne({"comments._id": _id}, function (err, usercomment) {
                        if (err || !usercomment) return res.send({
                            "response": false,
                            "value": "not find user comment"
                        });

                        let indexP = usercomment.comments.findIndex(comment => comment._id+"" === _id+"");

                        if (indexP < 0) {
                            return res.send({
                                "response": false,
                                "value": "not find index comment"
                            });
                        }
                        usercomment.comments[indexP].status = !usercomment.comments[indexP].status;
                        usercomment.save(function (err, usercommentupdate) {
                            if (err) return res.send({
                                "response": false,
                                "value": "errors update comment"
                            });
                            return res.send({
                                "response": true,
                                "value": usercommentupdate.comments[indexP]
                            });
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
                    "value": "not find user"
                });
            }
        );
}

// delete comment
exports.delete_comments = (req, res) => {
    let {_id} = req.body;
    let {phone} = req.user;
    if (phone === undefined  || _id === undefined) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    FindOneUserObj({phone})
        .then(userf => {
                if (userf) {
                    if (userf.roleType !== 0) {
                        return res.send({
                            "response": false,
                            "value": "user is not allowed to view this content"
                        });
                    }
                    User.findOne({"comments._id": _id}, function (err, usercomment) {
                        if (err || !usercomment) return res.send({
                            "response": false,
                            "value": "not find user comment"
                        });
                        let commentde = usercomment.comments.id(_id).remove();
                        // Equivalent to `parent.child = null`
                        usercomment.save(function (err) {
                            if (err)if (err) return res.send({
                                "response": false,
                                "value": "errors delete comment"
                            });
                            return res.send({
                                "response": true,
                                "value": commentde
                            });
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
                    "value": "not find user"
                });
            }
        );
}

exports.FindOneUserObj = FindOneUserObj;
exports.findAllBusiness = findAllBusiness;
exports.FindUserSocketID = FindUserSocketID;
exports.findUserId = findUserId;
// tìm kiếm người dùng qua số điện thoại
exports.find_user_phone = findUserPhone;
exports.findAllUser = findAllUser;
exports.UpdateUser = UpdateUser;
