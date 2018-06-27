'use strict';
const Purchase = require('../models/purchaseModel'),
    User = require("../models/userModel"),
    config = require("../config"),
    path = require('path'),
    multer = require('multer'),
    fs = require('fs');

/*
* tìm và xuất ra tất cả các document bán đã được admin duyệt
* $ne:1 - là tìm các doccument khác 1, ở trạng 1 là trạng tháy chưa được duyệt
* */
let FindPurchaseAll = () => {
    return new Promise((resolve, reject) => {
        Purchase.find({status: {'$ne': 1}}, function (err, Purchase) {
            if (err) return reject(err);
            resolve(Purchase);
        });
    });
};


/*
*  function tìm và xuất ra tất cả các document bán đã được admin duyệt
* Api: /api/purchase/list
* method: get
* */
exports.get_list_all = function (req, res) {
    FindPurchaseAll()
        .then(
            Purchase => {
                if (Purchase) {
                    return res.json({
                        value: Purchase,
                        response: true
                    });
                } else {
                    return res.json({
                        value: "Not find",
                        response: false
                    });
                }
            },
            err => {
                return res.json({
                    value: err,
                    response: false
                });
            }
        );
}

/*
*  function tìm và xuất ra tất cả các document bán của một người dùng,
*  thông qua địa chỉ id của họ
* */
let FindPurchase = (id) => {
    return new Promise((resolve, reject) => {
        Purchase.find({accountID: id}, function (err, Purchase) {
            if (err) return reject(err);
            resolve(Purchase);
        });
    });
}

/*
*  function tìm và xuất ra 1 document bán qua id của document,
* */
let FindOnePurchase = (id) => {
    return new Promise((resolve, reject) => {
        Purchase.findOne({_id: id}, function (err, Purchase) {
            if (err) return reject(err);
            resolve(Purchase);
        });
    });
}

/*
*  function tạo mới 1 document bán,
* */
let createPurchase = (obj) => {
    return new Promise((resolve, reject) => {
        Purchase.create(obj, function (err, Purchase) {
            if (err) return reject(err);
            resolve(Purchase);
        });
    });
}

/*
*  function tìm và xuất ra tất cả các document bán của 1 người dùng
* Api: /api/purchase/list
* method: post
* params:id <=> _id user
* */
exports.get_list = function (req, res) {
    FindPurchase(req.body.id)
        .then(
            Purchase => {
                if (Purchase) {
                    return res.json({
                        value: Purchase,
                        response: true
                    });
                } else {
                    return res.json({
                        value: "Not find",
                        response: false
                    });
                }
            },
            err => {
                return res.json({
                    value: err,
                    response: false
                });
            }
        );
}

/*
*  function tìm và xuất ra 1 document bán đúng với id mà người dùng càn tìm
* Api: /api/purchase/one
* method: post
* params:id <=> _id pawn
* */
exports.get_one = function (req, res) {
    FindOnePurchase(req.body.id)
        .then(
            Purchase => {
                if (Purchase) {
                    return res.json({
                        value: Purchase,
                        response: true
                    });
                } else {
                    return res.json({
                        value: "Not find",
                        response: false
                    });
                }
            },
            err => {
                return res.json({
                    value: err,
                    response: false
                });
            }
        );
}

/*
*  function tìm và xóa image bán theo id mà người dùng truyền vào
* vì các tập tin nằm trong cùng 1 thư mục người dùng có tên là số điện thoại
* việc đầu tiên đi tìm thông tin user (số điện thoại )
* tìm tên image trong document bán tương úng id truyền vào
* dùng lệnh unlinkSync để xóa image
* */
let deleteImage = (body) => {
    return new Promise((resolve, reject) => {
        User.findOne({_id: body.accountID}, function (err, user) {
            if (err) console.log(err);
            if (user) {
                Purchase.findOne({_id: body.id}, function (err, shipping) {
                    if (err) reject(err);
                    if (shipping) {
                        try {
                            fs.unlinkSync(uploadDir + user.phone + "/" + shipping.purchase_image);
                            resolve(shipping);
                        } catch (err) {
                            resolve(true);
                        }
                    }
                })
            }
        })
    })
}

/*
*  function tìm và xóa image nếu cập nhật dữ liệu thất bại
* vì các tập tin nằm trong cùng 1 thư mục người dùng có tên là số điện thoại
* việc đầu tiên đi tìm thông tin user (số điện thoại )
* dựa và filename chúng ta có tên file cần xóa
* dùng lệnh unlinkSync để xóa image
* */
let deleteImageNew = (body, filename) => {
    User.findOne({_id: body.accountID}, function (err, user) {
        if (err) console.log(err);
        if (user) {
            try {
                fs.unlinkSync(uploadDir + user.phone + "/" + filename);
            } catch (err) {
                console.log(err);
            }
        }
    })
};

/*
*  function tìm và update tên image bán
* dựa vào id và filename có sẳn
* */
let updatePurchase = (body, filename) => {
    return new Promise((resolve, reject) => {
        Purchase.findOneAndUpdate({_id: body.id}, {purchase_image: filename}, {new: true}, function (err, shipping) {
            if (err) reject(err);
            resolve(shipping);
        });
    });
}

/*
*  function tìm xóa tên file cũ và update tên image bán mới
* */
let DelAndUpdateImange = (body, filename) => {
    return new Promise((resolve, reject) => {
        deleteImage(body)
            .then(
                Del => {
                    updatePurchase(body, filename).then(
                        Purchase => {
                            if (Purchase) {
                                resolve(Purchase)
                            } else {
                                reject("update image shipping fail")
                            }
                        }, err => reject(err)
                    );
                }, err => {
                    reject(err)
                }
            );

    });
};

/*
*  function tìm xem thư mục có tồn tại, không có tại thư mục mới
* */
let checkDirectory = (directory, callback) => {
    fs.stat(directory, function (err, stats) {
        //Check if error defined and the error code is "not exists"
        if (err && err.errno === 34) {
            //Create the directory, call the callback.
            fs.mkdir(directory, callback);
        } else {
            //just in case there was a different error:
            callback(err)
        }
    });
}

/*
*  function upload ảnh
*  kiểm tra thư mục có tồn tại, không thì tạo thư mục mới
*  tên thư mục là tên số điện thoại
* */
let uploadDir = 'public/uploads/';
let Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        checkDirectory(uploadDir + req.user.phone, function (error) {
            if (error) {
                try {
                    fs.statSync(uploadDir + req.user.phone);
                } catch (e) {
                    fs.mkdirSync(uploadDir + req.user.phone);
                }
                cb(null, uploadDir + req.user.phone);
            } else {
                cb(null, uploadDir + req.user.phone);
            }
        });
    },
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
}).single('purchase_image'); //Field name and max count

/*
*  function insert image và update image
*  nếu có truyền id hiều là update vì document đã tồn tại
*  nếu không có id thì sẽ phát sinh cái mới
*  dung lượng tối đa cho phép là 6 mb
*  api: /api/purchase/image
*  method: post
*  params: pawn_image định dạng file
*  params: accountID _id user
*  params: id _id bảng bán
* */
exports.insert_image = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.json({
                "response": err,
                "value": false
            });
        } else {
            //console.log(req.file);
            if (req.file) {
                if (req.body.accountID) {
                    if (req.body.id) {
                        FindOnePurchase(req.body.id)
                            .then(
                                purchase => {
                                    if (purchase) {
                                        DelAndUpdateImange(req.body, req.file.filename).then(
                                            Purchase => {
                                                if (Purchase) {
                                                    return res.json({
                                                        "response": true,
                                                        "value": Purchase
                                                    });
                                                } else {
                                                    deleteImageNew(req.body, req.file.filename);
                                                    return res.json({
                                                        "response": false,
                                                        "value": "Tạo lưu data không thành công"
                                                    });
                                                }
                                            },
                                            err => {
                                                return res.json({
                                                    "response": false,
                                                    "value": err
                                                });
                                            }
                                        )
                                    } else {
                                        return createNewPurchase(req.body, req.file.filename);
                                    }
                                },
                                err => {
                                    deleteImageNew(req.body, req.file.filename);
                                    return res.json({
                                        "response": false,
                                        "value": err
                                    });
                                }
                            );

                    } else {
                        return createNewPurchase(req.body, req.file.filename);
                    }
                } else {
                    deleteImageNew(req.body, req.file.filename);
                    return res.json({
                        "response": false,
                        "value": "Tạo lưu data không thành công"
                    });
                }
            } else {
                return res.json({
                    "response": false,
                    "value": "not find id"
                });
            }
        }
    });
};

let createNewPurchase = (obj, filename) => {
    createPurchase({
        accountID: obj.accountID,
        pawn_image: filename,
    })
        .then(
            Purchase => {
                if (Purchase) {
                    return res.json({
                        "response": true,
                        "value": Purchase
                    });
                } else {
                    deleteImageNew(obj, filename);
                    return res.json({
                        "response": false,
                        "value": "Tạo lưu data không thành công"
                    });
                }
            },
            err => {
                return res.json({
                    "response": false,
                    "value": err
                });
            }
        )
};

/*
*  function insert bảng bán và update bán
*  nếu có truyền id hiều là update vì document đã tồn tại
*  nếu không có id thì sẽ phát sinh cái mới
*  api: /api/purchase/doc
*  method: post
*  params: các thông tin khác trong bảng bán trừ status
*  params: accountID _id user
*  params: id _id bảng bán
*/

exports.insert_doc = function (req, res) {
    req.body.status = undefined;
    if (req.body && req.body.accountID !== undefined) {
        if (req.body.id) {
            FindOnePurchase(req.body.id)
                .then(
                    purchase => {
                        if (purchase) {
                            Purchase.findOneAndUpdate({_id: req.body.id}, req.body, {new: true}, function (err, pawn) {
                                if (err) return res.json({
                                    "response": false,
                                    "value": err
                                });
                                if (pawn) {
                                    pawn.status = undefined;
                                    return res.json({
                                        "response": true,
                                        "value": pawn
                                    });
                                } else {
                                    return res.json({
                                        "response": false,
                                        "value": "Tạo lưu data không thành công"
                                    });
                                }
                            });
                        } else {
                            return createNewPurchaseDoc(req.body);
                        }
                    },
                    err => {
                        return res.json({
                            "response": false,
                            "value": err
                        });
                    });

        } else {
            return createNewPurchaseDoc(req.body);
        }

    } else {
        return res.json({
            "response": false,
            "value": "not find id"
        });
    }

};

let createNewPurchaseDoc = (obj) => {
    createPurchase(obj)
        .then(
            pawn => {
                if (pawn) {
                    pawn.status = undefined;
                    return res.json({
                        "response": true,
                        "value": pawn
                    });
                } else {
                    return res.json({
                        "response": false,
                        "value": "Tạo lưu data không thành công"
                    });
                }
            },
            err => {
                return res.json({
                    "response": false,
                    "value": err
                });
            }
        )
}