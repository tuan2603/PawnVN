'use strict';
const mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    async = require('async'),
    saltRounds = 10,
    jwt = require('jsonwebtoken'),
    User = mongoose.model('User'),
    Code = mongoose.model('VerifyCode'),
    UserDoc = mongoose.model('userdocs'),
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

let SendMessage = (toNumber, CONTENT) => {
    return new Promise((resolve, reject) => {
        nexmo.message.sendSms(
            config.NUMBER, toNumber, CONTENT, {type: 'unicode'},
            (err, responseData) => {
                if (err) reject(err);
                resolve(responseData);
            }
        );
    });
}

let SendMessageVN = (toNumber, CONTENT) => {
    return new Promise((resolve, reject) => {
        var option = {
            uri: 'http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get',
            qs: {// -> uri + '?access_token=xxxxx%20xxxxx'
                Phone: "0" + toNumber + "",
                Content: CONTENT,
                ApiKey: 'FE1612D2F42AE5FA207D92A8C41273',
                SecretKey: '4E8A4B9C4C578DBB803120B4F78BD5',
                SmsType: 6,
            },
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
        };

        rp(option)
            .then(function (repos) {
                resolve(repos);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

let comparePassword = function (password, user) {
    return bcrypt.compareSync(password, user.password);
}

let findUserBody = (body) => {
    return new Promise((resolve, reject) => {
        User.findOne({phone: body.phone, roleType: body.roleType}, function (err, user) {
            if (err) reject(err);
            resolve(user);
        });
    });
}

let findManyUserObj = (obj) => {
    return new Promise((resolve, reject) => {
        User.find(obj, function (err, users) {
            if (err) reject(err);
            resolve(users);
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
// tìm kiếm người dùng qua số điện thoại
exports.find_user_phone = findUserPhone;

let findUserId = (id) => {
    return new Promise((resolve, reject) => {
        User.findOne({_id: id}, function (err, user) {
            if (err) reject(err);
            resolve(user);
        });
    });
}
exports.findUserId = findUserId;

let findAllUser = () => {
    return new Promise((resolve, reject) => {
        User.find({}, function (err, user) {
            if (err) reject(err);
            resolve(user);
        });
    });
}
exports.findAllUser = findAllUser;
let findAllBusiness = () => {
    return new Promise((resolve, reject) => {
        User.find({roleType: 2}, function (err, user) {
            if (err) reject(err);
            resolve(user);
        });
    });
}
exports.findAllBusiness = findAllBusiness;
let findUserEmail = (email) => {
    return new Promise((resolve, reject) => {
        User.findOne({email: email}, function (err, user) {
            if (err) reject(err);
            resolve(user);
        });
    });
}
let SaveCoseVerify = (newCode) => {
    newCode.save(function (err, user) {
        if (err) console.log(err);
    });
};
let find_one_user_doc_id = (accountID) => {
    return new Promise((resolve, reject) => {
        UserDoc.findOne({accountID: accountID}, function (err, user) {
            if (err) reject(err);
            resolve(user);
        });
    });
}
let find_one_user_doc_obj = (obj) => {
    return new Promise((resolve, reject) => {
        UserDoc.findOne(obj, function (err, users) {
            if (err) reject(err);
            resolve(users);
        });
    });
}
let createUserDoc = (userDoc) => {
    return new Promise((resolve, reject) => {
        userDoc.save(function (err, user) {
            if (err) return reject(err);
            resolve(user);
        });
    });
}
let Register = (newUser, res) => {
    if (newUser.email !== "") {
        findUserEmail(newUser.email)
            .then(
                useremail => {
                    if (!useremail) {
                        newUser.save(function (err, user) {
                            if (err) {
                                console.log(Messages, err);
                                return res.send({
                                    message: Messages,
                                    value: 3
                                });
                            } else {
                                if (user) {
                                    return SingIN(user, res);
                                }
                                else {
                                    return res.send({
                                        message: Messages,
                                        value: 2
                                    });
                                }
                            }
                        });
                    } else {
                        return res.send({
                            message: Messages,
                            value: 9
                        });
                    }
                },
                err => {
                    return res.send({
                        message: Messages,
                        value: 9
                    });
                }
            )
    } else {
        newUser.save(function (err, user) {
            if (err) {
                console.log(Messages, err);
                return res.send({
                    message: Messages,
                    value: 3
                });
            } else {
                if (user) {
                    return SingIN(user, res);
                }
                else {
                    return res.send({
                        message: Messages,
                        value: 2
                    });
                }
            }
        });
    }
}
let RegisterWeb = (newUser, res, req) => {
    newUser.save(function (err, user) {
        if (err) {
            console.log(Messages, err);
            return res.status(400).send({
                message: Messages,
                value: 3
            });

        } else {
            if (user) {
                if (user.roleType === 2) {
                    let newDoc = new UserDoc(req.body);
                    newDoc.accountID = user._id;
                    newDoc.save(function (err, docuser) {
                        if (err) console.log(err);
                    });
                }
                return SingIN(user, res);
            }
            else {
                return res.status(400).send({
                    message: Messages,
                    value: 2
                });
            }
        }
    });
}
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
            return res.json({
                value: 6,
                message: Messages,
                code: Verification
            });
        } else {
            return res.json({
                value: 1,
                "message": Messages
            });
        }
    } else if (user.verifyType === 1) {
        //verify code sen message
        SaveCoseVerify(newCode);
        //gửi tin nhắn
        // SendMessageVN(user.phoneb, Verification)
        //     .then((repos) => {
        //         return res.json({
        //             value: 7,
        //             message: Messages,
        //             code: Verification
        //         });
        //     })
        //     .catch(function (err) {
        //         return res.json({
        //             value: 1,
        //             "message": Messages
        //         });
        //     });
        return res.json({
            value: 7,
            message: Messages,
            code: Verification
        });
        // SendMessage("+"+user.countryCode + user.phone, Verification)
        //     .then(
        //         responseData => {
        //             console.log(responseData);
        //             return res.json({
        //                 value: 7,
        //                 message: Messages
        //             });
        //         },
        //         err => {
        //             return res.json({
        //                 value: 1,
        //                 "message": Messages
        //             });
        //         })

    } else {
        return res.json({
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
            findUserPhone(req.body.phone)
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
    if (req.body.verifyType) {
        if (req.body.verifyType === 2) {
            findUserBody(req.body)
                .then(user => {
                        if (!user) {
                            return res.json({
                                message: mesVerify,
                                value: 1
                            })
                        } else if (user) {
                            if (user.active_type < 1) {
                                return res.json({
                                    message: mesVerify,
                                    value: 4
                                })
                            } else if (!comparePassword(req.body.code, user)) {
                                return res.json({
                                    message: mesVerify,
                                    value: 5
                                })
                            } else {
                                user.password = undefined;
                                return res.json({
                                    message: jwt.sign({
                                            phone: user.phone,
                                            create_at: user.create_at,
                                            email: user.email,
                                            fullName: user.fullName,
                                            _id: user._id
                                        },
                                        config.secret),
                                    value: 0,
                                    id: user._id,
                                });
                            }
                        }
                    },
                    err => {
                        return res.json({
                            value: 1,
                            message: mesVerify
                        })
                    });
        } else {
            findUserBody(req.body)
                .then(user => {
                        if (!user) {
                            return res.json({
                                value: 1,
                                message: mesVerify
                            })
                        } else {
                            findCode(user._id)
                                .then(
                                    codes => {
                                        if (codes) {
                                            if (codes.code === req.body.code) {
                                                if (user.activeType === 0) {
                                                    User.findOneAndUpdate(
                                                        {_id: user._id},
                                                        {activeType: 1}, {new: true}, function (err, useOne) {
                                                            console.log(err);
                                                        })
                                                }
                                                Code.deleteMany({
                                                    phone: user.phone
                                                }, function (err, re) {
                                                    if (err) console.log(err);
                                                })
                                                user.password = undefined;
                                                return res.json({
                                                    message: jwt.sign({
                                                        phone: user.phone,
                                                        create_at: user.create_at,
                                                        email: user.email,
                                                        fullName: user.fullName,
                                                        _id: user._id
                                                    }, config.secret),
                                                    value: 0,
                                                    id: user._id,
                                                });
                                            } else {
                                                return res.json({
                                                    value: 2,
                                                    message: mesVerify
                                                })
                                            }
                                        }
                                        else {
                                            return res.json({
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
                        }
                    },
                    err => {
                        return res.json({
                            value: 1,
                            message: mesVerify
                        })
                    });
        }
    }
    else {
        return res.json({
            value: 3,
            message: mesVerify
        })
    }

}
// verify cho code
exports.verify_web = function (req, res) {
    findUserPhone(req.body.phone)
        .then(user => {
                if (!user) {
                    return res.status(401).json({
                        value: 1,
                        message: mesVerify
                    })
                } else {
                    findCode(user._id)
                        .then(
                            codes => {
                                if (codes) {
                                    if (codes.code === req.body.code) {
                                        Code.deleteMany({
                                            phone: user.phone
                                        }, function (err, re) {
                                            if (err) console.log(err);
                                        });

                                        if (user.activeType === 0) {
                                            User.findOneAndUpdate(
                                                {_id: user._id},
                                                {activeType: 2}, {new: true}, function (err, useOne) {
                                                    useOne.password = undefined;
                                                    return res.status(200).json({
                                                        message: jwt.sign({
                                                            phone: useOne.phone,
                                                            create_at: useOne.create_at,
                                                            email: useOne.email,
                                                            fullName: user.fullName,
                                                            _id: useOne._id
                                                        }, config.secret),
                                                        value: 0,
                                                        id: useOne._id,
                                                        activeType: useOne.activeType,
                                                    });
                                                })
                                        } else {
                                            user.password = undefined;
                                            return res.status(200).json({
                                                message: jwt.sign({
                                                    phone: user.phone,
                                                    create_at: user.create_at,
                                                    email: user.email,
                                                    fullName: user.fullName,
                                                    _id: user._id
                                                }, config.secret),
                                                value: 0,
                                                id: user._id,
                                                activeType: user.activeType,
                                            });
                                        }

                                    } else {
                                        res.status(401).json({
                                            value: 2,
                                            message: mesVerify
                                        })
                                    }
                                }
                                else {
                                    res.status(401).json({
                                        value: 2,
                                        message: mesVerify
                                    })
                                }
                            },
                            err => {
                                res.status(401).json({
                                    value: 2,
                                    message: mesVerify
                                })
                            }
                        )
                }
            },
            err => {
                res.status(401).json({
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
    if (checkPass.validate(req.body.password)) {
        findUserEmail(req.body.email)
            .then(
                usermail => {
                    if (!usermail) {
                        findUserPhone(req.body.phone)
                            .then(
                                userphone => {
                                    if (!userphone) {
                                        let newUser = new User(req.body);
                                        newUser.verifyType = 1;
                                        newUser.roleType = 2;
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
                                                    //gửi tin nhắn
                                                    // SendMessageVN(user.phoneb, Verification)
                                                    //     .then((repos) => {
                                                    //         return res.json({
                                                    //             value: 7,
                                                    //             message: Messages,
                                                    //             code: Verification
                                                    //         });
                                                    //     })
                                                    //     .catch(function (err) {
                                                    //         return res.json({
                                                    //             value: 1,
                                                    //             "message": Messages
                                                    //         });
                                                    //     });
                                                    //đăng ks thêm thông tin phụ
                                                    if (user.roleType === 2) {
                                                        let newDoc = new UserDoc(req.body);
                                                        newDoc.accountID = user._id;
                                                        newDoc.save(function (err, docuser) {
                                                            if (err) console.log(err);
                                                        });
                                                    }
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
                    } else {
                        return res.send({
                            message: 'Email đã tồn tại',
                            value: 2
                        });
                    }
                },
                err => {
                    return res.send({
                        message: 'Email đã tồn tại',
                        value: 2
                    });
                }
            );
    } else {
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
    if (checkPass.validate(req.body.password)) {
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
                                    //gửi tin nhắn
                                    // SendMessageVN(user.phoneb, Verification)
                                    //     .then((repos) => {
                                    //         return res.json({
                                    //             value: 7,
                                    //             message: Messages,
                                    //             code: Verification
                                    //         });
                                    //     })
                                    //     .catch(function (err) {
                                    //         return res.json({
                                    //             value: 1,
                                    //             "message": Messages
                                    //         });
                                    //     });
                                    //đăng ks thêm thông tin phụ
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

    } else {
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
let FindOneUserDoc = (id) => {
    return new Promise((resolve, reject) => {
        UserDoc.findOne({accountID: id}, function (err, Profile) {
            if (err) return reject(err);
            resolve(Profile);
        });
    });
}
exports.profile = function (req, res) {
    User.findOne({_id: req.params.id}, function (err, User) {
        if (err) {
            return res.status(400).send({
                response: 'get profile fail',
                value: false
            });
        } else {
            if (User) {
                FindOneUserDoc(req.params.id)
                    .then(Profile => {
                        // console.log(Profile);
                        User.password = undefined;
                        res.json({
                            value: true,
                            response: Object.assign(JSON.parse(JSON.stringify(User)), JSON.parse(JSON.stringify(Profile)))
                        });
                    }, err => {
                        console.log(err);
                        User.password = undefined;
                        res.json({
                            value: true,
                            response: User
                        });
                    });
            } else {
                return res.status(400).send({
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
exports.update_password = function (req, res) {
    let {password, id} = req.body;
    if (password === undefined || id === undefined) {
        return res.send({
            value: 'not found params',
            response: false
        });
    }
    if (checkPass.validate(password)) {
        let passwordh = bcrypt.hashSync(password, saltRounds);
        User.findOneAndUpdate({_id: id}, {
            password: passwordh
        }, {new: true}, function (err, User) {
            if (err)
                return res.send({
                    value: 'Update fail',
                    response: false
                });
            FindOneUserDoc(id)
                .then(Profile => {
                    // console.log(Profile);
                    User.password = undefined;
                    res.json({
                        response: true,
                        value: Object.assign(JSON.parse(JSON.stringify(User)), JSON.parse(JSON.stringify(Profile)))
                    });
                }, err => {
                    console.log(err);
                    User.password = undefined;
                    res.json({
                        response: true,
                        value: User
                    });
                });
        });
    } else {
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
}

let uploadDir = config.folder_temp;
var Storage = multer.diskStorage({
    destination: uploadDir,
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + ".jpg");
    }
});
var upload = multer({
    storage: Storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname).toLowerCase();
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
            res.json({
                "response": false,
                "value": err,
            });
        } else {
            //console.log(req.file);
            if (req.file) {
                if (req.body.id === undefined) {
                    return res.json({
                        "response": false,
                        "value": "not find params id user"
                    });
                }
                findUserId(req.body.id)
                    .then(
                        userf => {
                            if (userf) {
                                if (userf.avatarLink) {
                                    //remove and overwrite
                                    try {
                                        fsextra.remove(path.join(`${config.folder_uploads}`, `${userf.phone}`, `${userf.avatarLink}`));
                                        console.log('success!')
                                    } catch (err) {
                                        console.error(err)
                                    }
                                }
                                {
                                    // update and move avatar from folder tepms to folder user( phone number)
                                    UpdateUserID({_id: req.body.id, avatarLink: req.file.filename})
                                        .then(useru => {
                                            fsextra.moveSync(
                                                path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                                path.join(`${config.folder_uploads}`, `${useru.phone}`, `${req.file.filename}`),
                                                {overwrite: true});
                                            FindAllInfoUser({_id: req.body.id})
                                                .then(userrp => {
                                                        return res.json({
                                                            value: userrp,
                                                            response: true
                                                        });
                                                    },
                                                    err => {
                                                        return res.json({
                                                            "response": false,
                                                            "value": err
                                                        });
                                                    }
                                                );
                                        }, err => {
                                            return res.json({
                                                "response": false,
                                                "value": err
                                            });
                                        })
                                }
                            } else {
                                return res.json({
                                    "response": false,
                                    "value": "not find user"
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
            } else {
                return res.json({
                    "response": false,
                    "value": "not find image"
                });
            }
        }
    });
};
let FindAllInfoUser = (obj) => {
    return new Promise((resolve, reject) => {
        User.findOne({_id: obj._id}, function (err, userf) {
            if (err) {
                return reject(err)
            } else {
                if (userf) {
                    FindOneUserDoc(obj._id)
                        .then(userdocf => {
                            if (userdocf) {
                                resolve(Object.assign(
                                    JSON.parse(JSON.stringify(userf)),
                                    JSON.parse(JSON.stringify(userdocf)))
                                );
                            } else {
                                resolve(userf);
                            }

                        }, err => {
                            return reject(err);
                        });
                } else {
                    return reject("not found")
                }
            }
        });
    });
}
let updateUserDoc = (obj, res) => {
    UserDoc.findOneAndUpdate({accountID: obj.id}, obj, {new: true}, function (err, UserD) {
        if (err)
            return res.send({
                response: err,
                value: false
            });
        if (!UserD) {
            findUserId(obj.id)
                .then(Profile => {
                    if (Profile) {
                        User.findOneAndUpdate({_id: obj.id}, obj, {new: true}, function (err, UserC) {
                            if (err) return res.json({
                                value: false,
                                response: err,
                            });
                            if (UserC) {
                                UserC.password = undefined;
                                return res.json({
                                    value: true,
                                    response: UserC
                                });
                            } else {
                                Profile.password = undefined;
                                return res.json({
                                    value: true,
                                    response: Profile
                                });
                            }
                        });
                    } else {
                        return res.send({
                            response: "khong tim thay",
                            value: false
                        });
                    }
                }, err => {
                    return res.send({
                        response: err,
                        value: false
                    });
                });
        } else {
            findUserId(UserD.accountID)
                .then(Profile => {
                    if (Profile) {
                        User.findOneAndUpdate({_id: UserD.accountID}, obj, {new: true}, function (err, UserC) {
                            if (err) return res.json({
                                value: false,
                                response: err,
                            });
                            if (UserC) {
                                UserC.password = undefined;
                                return res.json({
                                    value: true,
                                    response: Object.assign(JSON.parse(JSON.stringify(UserD)), JSON.parse(JSON.stringify(UserC)))
                                });
                            } else {
                                Profile.password = undefined;
                                return res.json({
                                    value: true,
                                    response: Object.assign(JSON.parse(JSON.stringify(UserD)), JSON.parse(JSON.stringify(Profile)))
                                });
                            }
                        });
                    } else {
                        return res.send({
                            response: "khong tim thay",
                            value: false
                        });
                    }
                }, err => {
                    return res.send({
                        response: err,
                        value: false
                    });
                });
        }
    });
}
// dung để update thông tin user phụ
exports.update_userdoc = (req, res) => {
    FindOneUserDoc(req.body.id)
        .then(
            userdoc => {
                if (userdoc) {
                    if (userdoc.accept !== undefined) {
                        if (userdoc.accept) {
                            return res.json({
                                "response": false,
                                "value": "Thông tin đã được duyệt bạn không được thay đổi"
                            });
                        } else {
                            return updateUserDoc(req.body, res);
                        }
                    } else {
                        return res.json({
                            "response": false,
                            "value": "Lỗi tìm thông tin phụ"
                        });
                    }
                } else {
                    //không có user phụ, tạo mới
                    let user = new UserDoc(req.body);
                    user.accountID = req.body.id;
                    createUserDoc(user)
                        .then(
                            userdoc => {
                                return updateUserDoc(req.body, res);
                            },
                            err => {
                                return res.json({
                                    "response": false,
                                    "value": err,
                                });
                            }
                        );
                }
            },
            err => {
                return res.json({
                    "response": false,
                    "value": "Lỗi tìm thông tin phụ"
                });
            }
        );
}
// dung để update thông tin user cả 2
exports.update_userboth = (req, res) => {
    FindOneUserDoc(req.body.id)
        .then(
            User => {
                if (User) {
                    return updateUserDoc(req.body, res);
                } else {
                    //không có user phụ, tạo mới
                    let user = new UserDoc(req.body);
                    user.accountID = req.body.id;
                    createUserDoc(user)
                        .then(
                            userdoc => {
                                return updateUserDoc(req.body, res);
                            },
                            err => {
                                return res.json({
                                    "response": false,
                                    "value": err,
                                });
                            }
                        );
                }
            },
            err => {
                return res.json({
                    "response": false,
                    "value": "Lỗi tìm thông tin phụ"
                });
            }
        );
}


exports.update_identityCardFront = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.json({
                "response": err,
                "value": false
            });
        } else {
            //console.log(req.file);
            if (req.file) {
                if (req.body.id === undefined || req.body.expression === undefined || req.body.folder === undefined) {
                    return res.json({
                        "response": false,
                        "value": "not find params id user"
                    });
                }
                FindOneUserDoc(req.body.id)
                    .then(
                        userf => {
                            if (userf) {
                                switch (req.body.expression) {
                                    case 'identityCardFront':
                                        if (userf.identityCardFront) {
                                            //remove
                                            try {
                                                fsextra.remove(path.join(`${config.folder_uploads}`, `${req.body.folder}`, `${userf.identityCardFront}`));
                                                console.log('success!')
                                            } catch (err) {
                                                console.error(err)
                                            }
                                        }
                                    {
                                        // update and move avatar from folder tepms to folder user( phone number)
                                        UpdateUserDocAccountID({
                                            accountID: req.body.id,
                                            identityCardFront: req.file.filename
                                        })
                                            .then(useru => {
                                                fsextra.moveSync(
                                                    path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                                    path.join(`${config.folder_uploads}`, `${req.body.folder}`, `${req.file.filename}`),
                                                    {overwrite: true});
                                                FindAllInfoUser({_id: req.body.id})
                                                    .then(userrp => {
                                                            return res.json({
                                                                value: userrp,
                                                                response: true
                                                            });
                                                        },
                                                        err => {
                                                            return res.json({
                                                                "response": false,
                                                                "value": err
                                                            });
                                                        }
                                                    );
                                            }, err => {
                                                return res.json({
                                                    "response": false,
                                                    "value": err
                                                });
                                            })
                                    }
                                        break;
                                    case 'identityCardBehind':
                                        if (userf.identityCardBehind) {
                                            try {
                                                fsextra.remove(path.join(`${config.folder_uploads}`, `${req.body.folder}`, `${userf.identityCardBehind}`));
                                                console.log('success!')
                                            } catch (err) {
                                                console.error(err)
                                            }
                                        }
                                    {
                                        // update and move avatar from folder tepms to folder user( phone number)
                                        UpdateUserDocAccountID({
                                            accountID: req.body.id,
                                            identityCardBehind: req.file.filename
                                        })
                                            .then(useru => {
                                                fsextra.moveSync(
                                                    path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                                    path.join(`${config.folder_uploads}`, `${req.body.folder}`, `${req.file.filename}`),
                                                    {overwrite: true});
                                                FindAllInfoUser({_id: req.body.id})
                                                    .then(userrp => {
                                                            return res.json({
                                                                value: userrp,
                                                                response: true
                                                            });
                                                        },
                                                        err => {
                                                            return res.json({
                                                                "response": false,
                                                                "value": err
                                                            });
                                                        }
                                                    );
                                            }, err => {
                                                return res.json({
                                                    "response": false,
                                                    "value": err
                                                });
                                            })
                                    }
                                        break;
                                    case 'licenseeImageFront':
                                        if (userf.licenseeImageFront) {
                                            try {
                                                fsextra.remove(path.join(`${config.folder_uploads}`, `${req.body.folder}`, `${userf.licenseeImageFront}`));
                                                console.log('success!')
                                            } catch (err) {
                                                console.error(err)
                                            }
                                        }
                                    {
                                        // update and move avatar from folder tepms to folder user( phone number)
                                        UpdateUserDocAccountID({
                                            accountID: req.body.id,
                                            licenseeImageFront: req.file.filename
                                        })
                                            .then(useru => {
                                                fsextra.moveSync(
                                                    path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                                    path.join(`${config.folder_uploads}`, `${req.body.folder}`, `${req.file.filename}`),
                                                    {overwrite: true});
                                                FindAllInfoUser({_id: req.body.id})
                                                    .then(userrp => {
                                                            return res.json({
                                                                value: userrp,
                                                                response: true
                                                            });
                                                        },
                                                        err => {
                                                            return res.json({
                                                                "response": false,
                                                                "value": err
                                                            });
                                                        }
                                                    );
                                            }, err => {
                                                return res.json({
                                                    "response": false,
                                                    "value": err
                                                });
                                            })
                                    }
                                        break;
                                    case 'licenseeImageBehind':
                                        if (userf.licenseeImageBehind) {
                                            try {
                                                fsextra.remove(path.join(`${config.folder_uploads}`, `${req.body.folder}`, `${userf.licenseeImageBehind}`));
                                                console.log('success!')
                                            } catch (err) {
                                                console.error(err)
                                            }
                                        }
                                    {
                                        // update and move avatar from folder tepms to folder user( phone number)
                                        UpdateUserDocAccountID({
                                            accountID: req.body.id,
                                            licenseeImageBehind: req.file.filename
                                        })
                                            .then(useru => {
                                                fsextra.moveSync(
                                                    path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                                    path.join(`${config.folder_uploads}`, `${req.body.folder}`, `${req.file.filename}`),
                                                    {overwrite: true});
                                                FindAllInfoUser({_id: req.body.id})
                                                    .then(userrp => {
                                                            return res.json({
                                                                value: userrp,
                                                                response: true
                                                            });
                                                        },
                                                        err => {
                                                            return res.json({
                                                                "response": false,
                                                                "value": err
                                                            });
                                                        }
                                                    );
                                            }, err => {
                                                return res.json({
                                                    "response": false,
                                                    "value": err
                                                });
                                            })
                                    }
                                        break;
                                    default:
                                        return res.json({
                                            "response": false,
                                            "value": "không tim thấy"
                                        });
                                }
                            } else {
                                return res.json({
                                    "response": false,
                                    "value": "not find user"
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
            } else {
                return res.json({
                    "response": false,
                    "value": "not find image"
                });
            }
        }
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
            return res.json({
                message: 'Lỗi tìm user',
                value: 5,
            })
        } else if (!user) {
            return res.json({
                message: 'Tài khoản không tồn tại',
                value: 2,
            })
        } else if (user.password !== undefined) {
            if (!comparePassword(req.body.password, user)) {
                return res.json({
                    message: 'Mật khẩu không đúng.',
                    value: 3,
                })
            } else if (user.activeType < 1) {
                return res.json({
                    message: 'Tài khoản chưa được xác thực',
                    value: 1,
                })
            } else {
                return res.json({
                    message: jwt.sign({
                        phone: user.phone,
                        create_at: user.create_at,
                        email: user.email,
                        fullName: user.fullName,
                        _id: user._id
                    }, config.secret),
                    value: 0,
                    id: user._id,
                    activeType: user.activeType,
                });
            }
        } else {
            return res.json({
                message: 'Tài khoản mật khẩu không tồn tại',
                value: 4,
            })
        }
    })
}
exports.loginRequired = function (req, res, next) {
    if (req.user) {
        next();
    } else {
        return res.status(401).json({message: 'Unauthorized user!'});
    }
};
let UpdateUserID = (obj) => {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({_id: obj._id}, obj, {new: true}, function (err, User) {
            if (err) return reject(err);
            User.password = undefined;
            resolve(User);
        });
    });
}

let UpdateUserDocAccountID = (obj) => {
    return new Promise((resolve, reject) => {
        UserDoc.findOneAndUpdate({accountID: obj.accountID}, obj, {new: true}, function (err, User) {
            if (err) return reject(err);
            resolve(User);
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
let FindUserSocketID = (obj) => {
    return new Promise((resolve, reject) => {
        User.findOne({socket_id: socket_id, _id: obj._id}, function (err, User) {
            if (err) return reject(err);
            resolve(User);
        });
    });
}
exports.FindUserSocketID = FindUserSocketID;
exports.connect = function (io, socket, obj) {
    //console.log("user: ", obj);
    // _id, device_token, isPlatform, offlineTime // không truyền lên
    findUserId(obj._id)
        .then(
            user => {
                if (user) {
                    if (user.offlineTime > 0) {
                        // người dùng đang online
                        // gửi lệnh kit out người dùng hiện tại
                        let socket_id_old = user.socket_id;
                        if (socket_id_old !== "") {
                            io.to(socket_id_old).emit("kit-out-user-connecting", user._id);
                        }
                        // update lại thông tin người dùng mới
                        UpdateUserID(Object.assign(obj, {offlineTime: Date.now(), socket_id: socket.id}))
                            .then(user => {
                                if (user) {
                                    socket.emit("connected", user._id);
                                }
                            }, err => console.log(err));
                    } else {
                        // người dùng đang offline, hoặc chưa có thiết bị nào kết nối
                        // update thông tin người dùng mới
                        UpdateUserID(Object.assign(obj, {offlineTime: Date.now()}))
                            .then(user => {
                                if (user) {
                                    socket.broadcast.emit("new-user-connect", user._id);
                                }
                            }, err => console.log(err));
                    }
                } else {
                    console.log("không tìm thấy user");
                }
            },
            err => {
                console.log(err);
            }
        )
};
exports.disconnect = function (socket) {
    UpdateUserSocketID({
        socket_id: socket.id,
        offlineTime: 0,
    }).then(
        user => {
            if (user) {
            } else {
                console.log("không tìm thấy user");
            }
        },
        err => {
            console.log(err);
        }
    )
};
exports.get_all_business = function (req, res) {
    findAllBusiness()
        .then(users => {
            let alluser = [];
            async.forEachOf(users, function (user, key, callback) {
                find_one_user_doc_id(user._id)
                    .then(doc => {
                            alluser.push(Object.assign(JSON.parse(JSON.stringify(user)), JSON.parse(JSON.stringify(doc))));
                            callback();
                        },
                        err => {
                            callback(err);
                        }
                    );
            }, function (err) {
                if (err) return res.json({
                    response: false,
                    value: err,
                });
                return res.json({
                    response: true,
                    value: alluser,
                })
            });
        }, err => {
            return res.json({
                response: false,
                value: err,
            })
        })
};
//get all user not follow
exports.get_all_user_business_follow = function (req, res) {
    findManyUserObj({roleType: 2})
        .then(users => {
            let alluser = [];
            async.forEachOf(users, function (user, key, callback) {
                find_one_user_doc_obj({accountID: user._id, accept: false})
                    .then(doc => {
                            alluser.push(Object.assign(JSON.parse(JSON.stringify(user)), JSON.parse(JSON.stringify(doc))));
                            callback();
                        },
                        err => {
                            callback(err);
                        }
                    );
            }, function (err) {
                if (err) return res.json({
                    response: false,
                    value: err,
                });
                return res.json({
                    response: true,
                    value: alluser,
                })
            });
        }, err => {
            return res.json({
                response: false,
                value: err,
            })
        })
};
exports.get_all_user_business_following = function (req, res) {
    findManyUserObj({roleType: 2})
        .then(users => {
            let alluser = [];
            async.forEachOf(users, function (user, key, callback) {
                find_one_user_doc_obj({accountID: user._id, accept: true})
                    .then(doc => {
                            alluser.push(Object.assign(JSON.parse(JSON.stringify(user)), JSON.parse(JSON.stringify(doc))));
                            callback();
                        },
                        err => {
                            callback(err);
                        }
                    );
            }, function (err) {
                if (err) return res.json({
                    response: false,
                    value: err,
                });
                return res.json({
                    response: true,
                    value: alluser,
                })
            });
        }, err => {
            return res.json({
                response: false,
                value: err,
            })
        })
};

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
//delete on userdoc, thông tin bảng phụ
let DeleteOneUserDoc = (obj) => {
    return new Promise((resolve, reject) => {
        UserDoc.findOneAndRemove(obj, function (err, userdoc) {
            if (err) return reject(err);
            resolve(userdoc);
        });
    });
}
//delte user and delete all table have relationship
let DeleteUser = (obj) => {
    return new Promise((resolve, reject) => {
        findUserId(obj._id)
            .then(
                userdl => {
                    //console.log(userdl);
                    if (userdl) {
                        if (userdl.roleType === 1) {
                            // = 1 là người dùng
                            // tìm tất cả các pawn của người dùng để xóa

                            DeleteAllPawnForUser(obj);
                            DeleteOneUserDoc({accountID: obj._id})
                                .then(usdl => {
                                    DeleteOneUser(obj)
                                        .then(
                                            userldlted => {
                                                if (userldlted) {
                                                    DeleteOneWallet({phone: userldlted.phone});
                                                }
                                                resolve(userldlted)
                                            },
                                            err => {
                                                reject(err);
                                            }
                                        )
                                }, err => {
                                    console.log(err);
                                    reject(err);
                                });
                        } else if (userdl.roleType === 2) {
                            // = 2 là bussiness
                            DeleteOneUserDoc({accountID: obj._id})
                                .then(usdl => {
                                    DeleteOneUser(obj)
                                        .then(
                                            userldlted => {
                                                if (userldlted) {
                                                    DeleteOneWallet({phone: userldlted.phone});
                                                }
                                                resolve(userldlted)
                                            },
                                            err => {
                                                reject(err);
                                            }
                                        )
                                }, err => {
                                    console.log(err);
                                    reject(err);
                                });
                        } else {
                            // không tồn tại hoặc là admin không được xóa
                            reject("không xóa được, không tồn tại hoặc là admin");
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
