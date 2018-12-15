'use strict';
const Contract = require('../models/contractModel');
const User = require('../controllers/userController');
const Wallets = require('../controllers/walletsController');
const tradeHistory = require('../controllers/tradeHistoryController');
const  notification = require("../ultils/notification");

let UpdateContractOne = (condition, update) => {
    return new Promise((resolve, reject) => {
        Contract.findOneAndUpdate(condition, update, {new: true}, function (err, contract) {
            if (err) reject(err);
            resolve(contract);
        });
    });
};

let FindContractOneObj = (obj) => {
    return new Promise((resolve, reject) => {
        Contract.findOne(obj, function (err, contract) {
            if (err) return reject(err);
            resolve(contract);
        });
    });
};

let FindContractAll = (obj) => {
    return new Promise((resolve, reject) => {
        Contract.find(obj, function (err, contracts) {
            if (err) return reject(err);
            resolve(contracts);
        });
    });
};

let createContract = (obj) => {
    return new Promise((resolve, reject) => {
        Contract.create(obj, function (err, contract) {
            if (err) return reject(err);
            resolve(contract);
        });
    });
}

let create_new_contract = (obj) => {
    let {pawn_info, customer_id, owner_id} = obj;
    let contract = new Contract({_id:pawn_info._id, pawn_info, customer_id, owner_id});
    if (pawn_info) {
        let auction = pawn_info.auction[0];
        let tong_tien_lai = (auction.price * (auction.interest_rate / 100) * (pawn_info.date_time / 30));
        let so_lan_dong_lai = Math.round(pawn_info.date_time / auction.period);
        let arr = [];
        for (let i = 1; i <= so_lan_dong_lai; i++) {
            arr.push(i);
        }
        if (so_lan_dong_lai > 0) {
            let tien_moi_ky = tong_tien_lai / so_lan_dong_lai;
            Async.forEachOf(arr, function (item, key, callback) {
                if (item === so_lan_dong_lai) {
                    contract.list_payment.push({
                        arrival_date: Date.now() + item * auction.period * 86400000,
                        payment: tong_tien_lai - (tien_moi_ky * (item - 1)),
                    });
                    callback();
                } else {
                    contract.list_payment.push({
                        arrival_date: Date.now() + item * auction.period * 86400000,
                        payment: tien_moi_ky,
                    });
                    callback();
                }
            }, function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                contract.save(function (err, contactn) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log('Success!', contactn);
                });
            })
        } else {
            contract.list_payment.push({
                arrival_date: Date.now() + auction.period * 86400000,
                payment: tong_tien_lai,
            });
            contract.save(function (err, contactn) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log('Success!', contactn);
            });
        }
    }
}

exports.insert_payment = (req, res) => {
    let {_id, payment} = req.body;
    let {phone} = req.user;
    if (phone === undefined || _id === undefined || payment === undefined) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    User.FindOneUserObj({phone})
        .then(userf => {
                if (userf) {
                    FindContractOneObj({_id})
                        .then(contractf => {
                            if (contractf) {
                                Wallets.FindWalletsOne({accountID: userf._id})
                                    .then(walletf => {
                                        if (walletf) {
                                            if (payment > walletf.balance) {
                                                return res.send({
                                                    "response": false,
                                                    "value": "không đủ tiền để thực hiện giao dịch"
                                                });
                                            }
                                            Wallets.updateWallets({
                                                accountID: userf._id,
                                                balance: walletf.balance - payment
                                            })
                                                .then(
                                                    wlupd => {
                                                        if (wlupd) {
                                                            tradeHistory.CreateTradeHistory({
                                                                pricepay: payment*(-1),
                                                                accountID: userf._id,
                                                                description: notification.wallet_payment,
                                                            });
                                                            contractf.history_payment.push({payment});
                                                            contractf.save(function (err,contractu) {
                                                                if (err){
                                                                    return res.send({
                                                                        "response": false,
                                                                        "value": "cập nhật lịch sữ đóng lãi bị lỗi"
                                                                    });
                                                                }
                                                                return res.send({
                                                                    "response": true,
                                                                    "value": contractu
                                                                });
                                                            });
                                                        } else {
                                                                return res.send({
                                                                    "response": false,
                                                                    "value": "cập nhật ví tiền bị lỗi"
                                                                });
                                                        }
                                                    },
                                                    err => {
                                                        return res.send({
                                                            "response": false,
                                                            "value": "cập nhật ví tiền bị lỗi"
                                                        });
                                                    })
                                        }
                                    }, err => {
                                        return res.send({
                                            "response": false,
                                            "value": "not find wallet"
                                        });
                                    })
                            } else {
                                return res.send({
                                    "response": false,
                                    "value": "not found contract"
                                });
                            }
                        }, err => {
                            return res.send({
                                "response": false,
                                "value": "not found contract"
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
                    "value": "not find user"
                });
            })
}

exports.find_contract_borrower = (req, res) => {
    let {phone} = req.user;
    if (phone === undefined ) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    User.FindOneUserObj({phone})
        .then(userf => {
                if (userf) {
                    FindContractAll({customer_id:userf._id})
                        .then(contractsf => {
                            if (contractsf.length > 0) {
                                return res.send({
                                    "response": true,
                                    "value": contractsf
                                });
                            } else {
                                return res.send({
                                    "response": false,
                                    "value": "not found contract"
                                });
                            }
                        }, err => {
                            return res.send({
                                "response": false,
                                "value": "not found contract"
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
                    "value": "not find user"
                });
            })
}

exports.find_contract_lender = (req, res) => {
    let {phone} = req.user;
    if (phone === undefined ) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    User.FindOneUserObj({phone})
        .then(userf => {
                if (userf) {
                    FindContractAll({owner_id:userf._id})
                        .then(contractsf => {
                            if (contractsf.length > 0) {
                                return res.send({
                                    "response": true,
                                    "value": contractsf
                                });
                            } else {
                                return res.send({
                                    "response": false,
                                    "value": "not found contract"
                                });
                            }
                        }, err => {
                            return res.send({
                                "response": false,
                                "value": "not found contract"
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
                    "value": "not find user"
                });
            })
}

exports.find_contract_id = (req, res) => {
    let {_id} = req.params;
    let {phone} = req.user;
    if (phone === undefined || _id === undefined ) {
        return res.send({
            "response": false,
            "value": "not find params "
        });
    }
    User.FindOneUserObj({phone})
        .then(userf => {
                if (userf) {
                    FindContractOneObj({_id})
                        .then(contractsf => {
                            if (contractsf) {
                                return res.send({
                                    "response": true,
                                    "value": contractsf
                                });
                            } else {
                                return res.send({
                                    "response": false,
                                    "value": "not found contract"
                                });
                            }
                        }, err => {
                            return res.send({
                                "response": false,
                                "value": "not found contract"
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
                    "value": "not find user"
                });
            })
}

exports.total_amount_disbursed = (req, res) => {
    FindContractAll({})
        .then(contractall =>{
            if (contractall.length === 0) {
                return res.send({
                    "response": true,
                    "value": {no_contract: 0, imoney: 0}
                });
            }
            let imoney = 0;
            let no_contract = 0;
            Async.forEachOf(contractall, function (contract, key, callback) {
               imoney = imoney + contract.pawn_info.auction[0].price*1;
                no_contract++;
            }, function (err) {
                if (err) {
                    return res.send({
                        "response": true,
                        "value": {no_contract: 0, imoney: 0}
                    });
                }

                return res.send({
                    "response": true,
                    "value": {no_contract: 0, imoney: 0}
                });
            })
    }, err=> {
            return res.send({
                "response": true,
                "value": {no_contract: 0, imoney: 0}
            });
        })
}

exports.UpdateContractOne = UpdateContractOne;
exports.FindContractOneObj = FindContractOneObj;
exports.createContract = createContract;
exports.create_new_contract = create_new_contract;
