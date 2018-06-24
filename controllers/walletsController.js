'use strict';
const Wallets = require('../models/walletsModel');
const tradeHistory = require('../controllers/tradeHistoryController');

/*
* tìm giá theo accountID and phone
* */
let FindWalletsID = (accountID, phone) => {
    return new Promise((resolve, reject) => {
        Wallets.findOne({accountID: accountID, phone: phone}, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};

/*
* tìm giá theo accountID
* */
let FindWalletsOne = (accountID) => {
    return new Promise((resolve, reject) => {
        Wallets.findOne({accountID: accountID}, function (err, Pawn) {
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
        wl.save(function (err, wl) {
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
        User.findOneAndUpdate({
            accountID: obj.accountID
        }, {balance: obj.balance}, {new: true}, function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });
    });
}

/*
*  function tìm giá theo id
* */
exports.find_one_wallet = function (accountID, phone) {
    console.log(accountID, phone);
    FindWalletsID(accountID, phone)
        .then(
            wl => {
                if (wl) {
                    console.log(wl.balance);
                    return wl.balance;
                } else {
                    let newWL = new Wallets({accountID, phone});
                    createWallets(newWL);
                    return 0;
                }
            },
            err => {
                return 0;
            }
        )
}

/*
*  function update wallet and create history trade
* */
exports.update_wallet_pawn = function (obj) {
    FindWalletsOne(obj)
        .then(
            wlold => {
                if (wlold) {
                    obj.balance = wlold.balance -  obj.balance;
                    updateWallets(obj)
                        .then(
                            wl => {
                                if (wl) {
                                    tradeHistory.insert_trade_history({
                                        pricelistID:obj.pricelistID,
                                        accountID:obj.accountID,
                                    });
                                }
                            },
                            err => {
                                console.log(err);
                            }
                        )
                }
            },
            err => {
                console.log(err);
            }
        )
}