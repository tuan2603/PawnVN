'use strict';
const Wallets = require('../models/walletsModel');
const tradeHistory = require('../controllers/tradeHistoryController');
const notification = require('../ultils/notification');

/*
* tìm giá theo accountID and phone
* */
let FindWalletsID = (obj) => {
    return new Promise((resolve, reject) => {
        Wallets.findOne({accountID: obj.accountID, phone: obj.phone}, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};

/*
* tìm giá theo accountID
* */
let FindWalletsOne = (obj) => {
    return new Promise((resolve, reject) => {
        Wallets.findOne(obj, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};

/*
*  function tạo mới 1 một wallet cho người dùng
* */
let createWallets = (wl) => {
    return new Promise((resolve, reject) => {
        let newWL= new Wallets(wl);
        newWL.save(function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });
    });
};

/*
*  function tạo update wallet qua accountID
* */
let updateWallets = (obj) => {
    return new Promise((resolve, reject) => {
        Wallets.findOneAndUpdate({
            accountID: obj.accountID
        }, {balance: obj.balance}, {new: true}, function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });
    });
}


// delete wallet
let DeleteOneWallet = (obj) => {
    return new Promise((resolve, reject) => {
        Wallets.findOneAndRemove(obj, function (err, wldl) {
            if (err) return reject(err);
            resolve(wldl);
        });
    });
};

/*
*  api get wallet find user
* */
exports.find_one_wallet = function (req, res) {
    if ( req.body.accountID === undefined || req.user.phone === undefined)  {
        return res.json({
            response: false,
            value: "not find params or Unauthorized user!"
        })
    }
    let {accountID} = req.body;
    let {phone} = req.user;

    FindWalletsOne({accountID:accountID,phone:phone})
        .then(
            wlf => {
                if (wlf) {
                    return res.json({
                        response: true,
                        value: wlf
                    })
                } else {
                    createWallets({accountID, phone}).
                    then(
                        wlnew => {
                            return res.json({
                                response: true,
                                value: wlnew
                            })
                        },
                        err => {
                            return res.json({
                                response: false,
                                value: err
                            })
                        }
                    )
                }
            },
            err => {
                return res.json({
                    response: false,
                    value: err
                })
            }
        )
}


//api update wallet from user
exports.update_wallet_user = function (req, res) {
    if ( req.body.accountID === undefined || req.user.phone === undefined)  {
        return res.json({
            response: false,
            value: "not find params or Unauthorized user!"
        })
    }
    let {accountID, balance} = req.body;
    let {phone} = req.user;

    FindWalletsOne({accountID:accountID,phone:phone})
        .then(
            wlf => {
                if (wlf) {
                   let balancenew = wlf.balance +  balance;
                    updateWallets({accountID:accountID,balance:balancenew})
                        .then(
                            wlupd => {
                                if (wlupd) {
                                    tradeHistory.CreateTradeHistory({
                                        pricepay:balancenew,
                                        accountID:accountID,
                                        description: notification.update_wallet,
                                    });
                                    return res.json({
                                        response: true,
                                        value: wlupd
                                    })
                                }else{
                                    return res.json({
                                        response: false,
                                        value: "update wallet false"
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
                } else {
                    createWallets({
                        accountID: accountID,
                        phone: phone,
                        balance: balance,
                    }).then(
                        wlnew => {
                            tradeHistory.CreateTradeHistory({
                                pricepay:balance,
                                accountID:accountID,
                                description: notification.update_wallet,
                            });
                            return res.json({
                                response: true,
                                value: wlnew
                            })
                        },
                        err => {
                            return res.json({
                                response: false,
                                value: err
                            })
                        }
                    );
                }
            },
            err => {
                return res.json({
                    response: false,
                    value: err
                })
            }
        )
}

exports.FindWallets = FindWalletsID;
exports.FindWalletsOne = FindWalletsOne;
exports.createWallets = createWallets;
exports.updateWallets = updateWallets;
exports.DeleteOneWallet = DeleteOneWallet;