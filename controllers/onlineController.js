'use strict';
const Online = require('../models/userOnlineModel');
const {FindOneUserObj, UpdateUser} = require('../controllers/userController');
const config = require('../config');
const jsonwebtoken = require("jsonwebtoken");

let FindAllUserOnline = (obj) => {
    return new Promise((resolve, reject) => {
        Online.find(obj, function (err, users) {
            if (err) reject(err);
            resolve(users);
        });
    });
};

let FindOneUserOnline = (obj) => {
    return new Promise((resolve, reject) => {
        Online.findOne(obj, function (err, users) {
            if (err) reject(err);
            resolve(users);
        });
    });
};

let UpdateOneUserOnline = (condition, updateinfo) => {
    return new Promise((resolve, reject) => {
        Online.findOneAndUpdate(condition, updateinfo, {new: true}, function (err, user) {
            if (err) return reject(err);
            resolve(user);
        });
    });
}

let DeleteOneUserOnline = (obj) => {
    return new Promise((resolve, reject) => {
        Online.findOneAndRemove(obj, function (err, usero) {
            if (err) return reject(err);
            resolve(usero);
        });
    });
};

let CreateUserOnline = (obj) => {
    return new Promise((resolve, reject) => {
        let newUser = new Online(obj);
        newUser.save(function (err, user) {
            if (err) return reject(err);
            resolve(user);
        });
    });
};

let connect = (obj) => {
    let {socket, io} = obj;
    let {authorization, device_token, isPlatform} = obj.info;
    let user = null;
    if (authorization && authorization.split(' ')[0] === config.bearer) {
        jsonwebtoken.verify(authorization.split(' ')[1], config.secret, function (err, decode) {
            if (err) {
                // connect lại
                socket.emit("connected", {response: false, err: 'Unauthorized user!'});
                return;
            }
            user = decode;
        });
    }
    if (!user) {
        socket.emit("connected", {response: false, err: 'not user!'});
        return;
    }
    console.log("connect",user.fullName);
    FindOneUserObj({_id: user._id})
        .then(userf => {
            if (!userf) {
                // yêu cầu đằng xuất
                socket.emit("requiriment-disconnect", {err: 'not user!'});
                return;
            }

            CreateUserOnline({socket_id: socket.id, user_id: userf._id,isPlatform, device_token})
                .then(userc => {
                        if (!userc) {
                            // connect thất bại
                            socket.emit("connected", {
                                response: false,
                                err: "connect thất bại"
                            });
                            return;
                        }
                        // bao connect thanh công
                        socket.emit("connected", {
                            response: true,
                            value:userc,
                            socket_id: socket.id
                        });

                        // update thông tin người dùng
                        UpdateUser({_id: user._id},{isPlatform, device_token,offlineTime: Date.now()});
                    }, err => {
                        //console.log(err);
                        socket.emit("connected", {response: false,err: err});
                    }
                );

        }, err => {
            socket.emit("requiriment-disconnect", {err:err});
        })

};

let disconnect = (socket_id) => {
    DeleteOneUserOnline({socket_id})
        .then(userOdel=>{
            if (userOdel) {
                FindOneUserOnline({user_id:userOdel.user_id})
                    .then(users=>{
                       if (!users) {
                           UpdateUser({_id: userOdel.user_id},{offlineTime: 0});
                       }
                    },err=>{
                        console.log();
                    });

            }
        },err=>{
            console.log();
        })
}

let removeOnline = () =>{
    Online.remove({}, function(err,useronline) {
        if (err) {
            console.log(err)
        } else {
           console.log("useronline",useronline);
        }
    });
}

exports.connect = connect;
exports.disconnect = disconnect;
exports.removeOnline = removeOnline;
exports.FindAllUserOnline = FindAllUserOnline;
exports.FindOneUserObj = FindOneUserObj;
