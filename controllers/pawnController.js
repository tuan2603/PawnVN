'use strict';
/*
* danh sach các món đồ mới status là 1 và sánh thời gian đấu giá > thời gian hiện tại,
* các món đồ đã đấu giá là 2 và có id của chủ tiệm cầm đồcác món đồ hết hạn status  =2, id chủ tiệm cầm đồ ,  date_time < date now
* 1/ Lúc k.h chọn chủ tiệm cầm đồ là trừ tiền của chủ tiệm.
* 2/ Lúc k.h gia hạn thêm thời gian cho món đồ hết hạn (trừ tiền của k.h
* -> Sau đó mình tính lãi từ số tiền đó và trừ ra
* -> Số tiền còn lại chuyển wa cho chủ tiệm).
*/
const Pawn = require('../models/pawnModel'),
    User = require("../models/userModel"),
    UserCrt = require("../controllers/userController"),
    Ios = require("../controllers/notifyIOSController"),
    Distance = require("../ultils/distance"),
    path = require('path'),
    multer = require('multer'),
    fs = require('fs'),
    fsextra = require('fs-extra'),
    config = require('../config'),
    Async = require('async');

//delete one Pawn
let DeleteOnePawn = (obj) => {
    return new Promise((resolve, reject) => {
        Pawn.findOneAndRemove(obj, function (err, pawndl) {
            if (err) return reject(err);
            resolve(pawndl);
        });
    });
};
//delete on Pawn include image
let delete_one_pawn = (obj) => {
    return new Promise((resolve, reject) => {
        deleteImage({id: obj._id})
            .then(result => {
                if (result) {
                    DeleteOnePawn(obj)
                        .then(
                            pawndl => {
                                if (pawndl) {
                                    resolve(pawndl);
                                } else {
                                    reject("xóa pawn thất bại");
                                }
                            },
                            err => reject(err)
                        )
                } else {
                    reject("xóa pawn thất bại");
                }
            }, err => {
                reject(err);
            })
    });
};

exports.delete_one_pawn = delete_one_pawn;
/*
* update Pawn dựa theo chính id của pawn đó
* */
let UpdatePawnObj = (Obj) => {
    return new Promise((resolve, reject) => {
        Pawn.findOneAndUpdate({_id: Obj._id}, Obj, {new: true}, function (err, pawn) {
            if (err) reject(err);
            resolve(pawn);
        });
    });
};
exports.update_pawn_obj = UpdatePawnObj;


/*
* tìm và xuất ra tất cả các document cầm đồ đã được admin duyệt
* $ne:1 - là tìm các doccument khác 1, ở trạng 1 là trạng tháy chưa được duyệt
* */
let FindPawnAll = () => {
    return new Promise((resolve, reject) => {
        Pawn.find({
            //status: {'$ne': 1}
        }, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};

let FindPawnAllObj = (obj) => {
    return new Promise((resolve, reject) => {
        Pawn.find(obj, function (err, pawns) {
            if (err) return reject(err);
            resolve(pawns);
        });
    });
};


/*
*  function tìm và xuất ra tất cả các document cầm đồ đã được admin duyệt
* Api: /api/pawn/list
* method: get
* */
exports.get_list_all = function (req, res) {
    FindPawnAll()
        .then(
            Pawn => {
                if (Pawn) {
                    return res.json({
                        value: Pawn,
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
*  function tìm và xuất ra tất cả các document cầm đồ của một người dùng,
*  thông qua địa chỉ id của họ
* */
let FindPawn = (id) => {
    return new Promise((resolve, reject) => {
        Pawn.find({accountID: id}, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};

//delete all pawn follow user id
let DeleteAllPawnForUser = (obj) => {
    Pawn.find({accountID: obj._id}, function (err, pawnall) {
        if (err) return console.log(err);
        pawnall.map((pawndl, index) => {
            delete_one_pawn({_id: pawndl._id})
                .then(
                    pawndlted => console.log(pawndlted),
                    err => console.log(err)
                )
        });
    });
};

exports.DeleteAllPawnForUser = DeleteAllPawnForUser;

let FindPawnDdeleted = (obj) => {
    return new Promise((resolve, reject) => {
        Pawn.find(obj, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};


/*
*  function tìm và xuất ra 1 document cầm đồ qua id của document,
* */
let FindOnePawn = (id) => {
    return new Promise((resolve, reject) => {
        Pawn.findOne({_id: id}, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
}

/*
*  function tạo mới 1 document cầm đồ,
* */
let createPawn = (obj) => {
    return new Promise((resolve, reject) => {
        Pawn.create(obj, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
}

/*
*  function tìm và xuất ra tất cả các document cầm đồ của 1 người dùng
* Api: /api/pawn/list
* method: post
* params:id <=> _id user
* */
exports.get_list = function (req, res) {
    if (req.body.id === undefined) {
        return res.json({
            value: "Not find id",
            response: false
        });
    }
    FindPawnDdeleted({accountID: req.body.id, deleted: false})
        .then(
            Pawn => {
                if (Pawn) {
                    return res.json({
                        value: Pawn,
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
};

/*
*  function tìm và xuất ra 1 document cầm đồ đúng với id mà người dùng càn tìm
* Api: /api/pawn/one
* method: post
* params:id <=> _id pawn
* */
exports.get_one = function (req, res) {
    FindOnePawn(req.body.id)
        .then(
            Pawn => {
                if (Pawn) {
                    return res.json({
                        value: Pawn,
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
*  function tìm và xóa image cầm đồ theo id mà người dùng truyền vào
* vì các tập tin nằm trong cùng 1 thư mục người dùng có tên là số điện thoại
* việc đầu tiên đi tìm thông tin user (số điện thoại )
* tìm tên image trong document cầm đồ tương úng id truyền vào
* dùng lệnh unlinkSync để xóa image
* */
let deleteImage = (body) => {
    return new Promise((resolve, reject) => {
        Pawn.findOne({_id: body.id}, function (err, pawn) {
            if (err) reject(err);
            if (pawn) {
                try {
                    fs.unlinkSync(uploadDir + "/" + pawn.pawn_image);
                    resolve(pawn);
                } catch (err) {
                    resolve(true);
                }
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
let deleteImageNew = (filename) => {
    try {
        fs.unlinkSync(uploadDir + "/" + filename);
    } catch (err) {
        console.log(err);
    }
};

/*
*  function tìm và update tên image cầm đồ
* dựa vào id và filename có sẳn
* */
let updatePawn = (body, filename) => {
    return new Promise((resolve, reject) => {
        Pawn.findOneAndUpdate({_id: body.id}, {pawn_image: filename}, {new: true}, function (err, shipping) {
            if (err) reject(err);
            resolve(shipping);
        });
    });
}

/*
*  function tìm xóa tên file cũ và update tên image cầm đồ mới
* */
let DelAndUpdateImange = (body, filename) => {
    return new Promise((resolve, reject) => {
        deleteImage(body)
            .then(
                Del => {
                    updatePawn(body, filename).then(
                        Pawn => {
                            if (Pawn) {
                                resolve(Pawn)
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
}


/*
*  function upload ảnh
*  kiểm tra thư mục có tồn tại, không thì tạo thư mục mới
*  tên thư mục là tên số điện thoại
* */
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
}).single('pawn_image'); //Field name and max count


/*
*  function insert image và update image
*  nếu có truyền id hiều là update vì document đã tồn tại
*  nếu không có id thì sẽ phát sinh cái mới
*  dung lượng tối đa cho phép là 6 mb
*  api: /api/pawn/image
*  method: post
*  params: pawn_image định dạng file
*  params: accountID _id user
*  params: id _id bảng cầm đồ
* */
exports.insert_image = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.json({
                "response": err,
                "value": false
            });
        }
        if (req.file) {
            if (req.body.accountID === undefined || req.user.phone === undefined) {
                return res.json({
                    "response": false,
                    "value": "not find params accountID user"
                });
            }
            let url_image = req.user.phone + "/" + req.file.filename;
            if (req.body.id) {
                FindOnePawn(req.body.id)
                    .then(
                        pawnf => {
                            if (pawnf) {
                                if (pawnf.pawn_image) {
                                    //remove
                                    try {
                                        fsextra.remove(path.join(`${config.folder_uploads}`, `${pawnf.pawn_image}`));
                                        console.log('success!')
                                    } catch (err) {
                                        console.error(err)
                                    }
                                }
                                UpdatePawnObj({_id: req.body.id, pawn_image: url_image})
                                    .then(pawnup => {
                                            fsextra.moveSync(
                                                path.join(`${config.folder_temp}`, `${req.file.filename}`),
                                                path.join(`${config.folder_uploads}`, `${req.user.phone}`, `${req.file.filename}`),
                                                {overwrite: true});
                                            return res.json({
                                                "response": true,
                                                "value": pawnup
                                            });
                                        },
                                        err => {
                                            return res.json({
                                                "response": false,
                                                "value": err
                                            });
                                        }
                                    );
                            } else {
                                return createNewPawn({
                                    accountID: req.body.accountID,
                                    url_image: url_image,
                                    filename: req.file.filename,
                                }, res);
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
                return createNewPawn({
                    accountID: req.body.accountID,
                    url_image: url_image,
                    filename: req.file.filename,
                }, res);
            }
        } else {
            return res.json({
                "response": false,
                "value": "lưu image thất bại"
            });
        }

    });
};

let createNewPawn = (obj, res) => {
    createPawn({
        accountID: obj.accountID,
        pawn_image: obj.url_image,
    })
        .then(
            pawnc => {
                if (pawnc) {
                    fsextra.moveSync(
                        path.join(`${config.folder_temp}`, `${obj.filename}`),
                        path.join(`${config.folder_uploads}`, `${obj.url_image}`),
                        {overwrite: true});
                    return res.json({
                        "response": true,
                        "value": pawnc
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
        );
}

/*
*  function insert bảng cầm đồ và update cầm đồ
*  nếu có truyền id hiều là update vì document đã tồn tại
*  nếu không có id thì sẽ phát sinh cái mới
*  api: /api/pawn/doc
*  method: post
*  params: các thông tin khác trong bảng cầm đồ trừ status
*  params: accountID _id user
*  params: id _id bảng cầm đồ
*/

exports.insert_doc = function (req, res) {
    if (req.body.accountID === undefined || req.user.phone === undefined) {
        return res.json({
            "response": false,
            "value": "not find params accountID user"
        });
    }
    if (req.body.id) {
        FindOnePawn(req.body.id)
            .then(
                pawn => {
                    if (pawn) {
                        Pawn.findOneAndUpdate({_id: req.body.id}, req.body, {new: true}, function (err, pawn) {
                            if (err) return res.json({
                                "response": false,
                                "value": err
                            });
                            if (pawn) {
                                //pawn.status = undefined;
                                if (pawn.deleted === true){
                                    send_notify_bussiness(pawn);
                                    Pawn.findOneAndUpdate({_id: req.body.id}, {deleted: false}, {new: true}, function (err) {
                                        console.log(err);
                                    });
                                }
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
                        return createNewPawnDoc(req.body, res);
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
        return createNewPawnDoc(req.body, res);
    }


};

let createNewPawnDoc = (obj, res) => {
    if (obj.status !== undefined) {
        obj.status = undefined;
    }
    createPawn(obj)
        .then(
            pawn => {
                if (pawn) {
                    // pawn.status = undefined;
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
};

let send_notify_bussiness = (pawn) => {
    let sockets = require('socket.io-client')('http://localhost:8080');
    sockets.emit("notify-pawn-c-b", JSON.stringify(pawn));
}

exports.notify = (io, socket, obj) => {
    UserCrt.findUserId(obj.accountID)
        .then(
            user => {
                if (user) {
                    FindOnePawn(obj._id)
                        .then(
                            pawn => {
                                if (pawn) {
                                    UserCrt.findAllBusiness()
                                        .then(
                                            users => {
                                                if (users.length > 0) {
                                                    Async.forEachOf(users, function (usk, key, callback) {
                                                        let distance = Distance.distance(usk.latitude, usk.longitude, pawn.latitude, pawn.longitude, "K");
                                                        if (distance <= 10.0) {
                                                            // người dùng đang online
                                                            console.log(distance);
                                                            if (usk.socket_id !== "" && usk.offlineTime > 0) {
                                                                io.to(usk.socket_id).emit("notify-pawn-c-b", pawn._id);
                                                            } else if (usk.isPlatform === 0 && usk.device_token !== "") {
                                                                // người dùng offline, kiểm tra người dùng có dùng ios không
                                                                Ios.sendNotifyIOS({
                                                                    device_token: usk.device_token,
                                                                    countMes: 1,
                                                                    content_text: "Có tin người đăng đấu giá " + pawn._id,
                                                                });
                                                            }
                                                        }
                                                        callback();
                                                    }, function (err) {
                                                        if (err) {
                                                            socket.emit("notifited", false);
                                                        } else {
                                                            socket.emit("notifited", true);
                                                        }
                                                    });
                                                } else {
                                                    // không tìm thấy người dùng, tin ảo
                                                    socket.emit("notifited", false);
                                                }
                                            },
                                            err => {
                                                console.log(err);
                                            }
                                        );
                                } else {
                                    // không tìm thấy người dùng, tin ảo
                                    socket.emit("notifited", false);
                                }
                            },
                            err => {
                                console.log(err);
                            }
                        );
                } else {
                    // không tìm thấy người dùng, tin ảo
                    socket.emit("notifited", false);
                }
            },
            err => {
                console.log(err);
            }
        );
};


exports.delete_all_pawn_trash = () => {
    FindPawnAllObj({deleted:true})
        .then(pawnsf => {
                if (!pawnsf) return;
                pawnsf.map((pawnd, index) => {
                    delete_one_pawn({_id:pawnd._id})
                        .then(
                            pawndl => console.log(pawndl),
                            err => console.log(err)
                        )
                })
            },
            err => console.log(err)
        );
}