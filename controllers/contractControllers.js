'use strict';
const Contract = require('../models/contractModel');

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
    let contract = new Contract(obj);
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
                if (err) { console.log(err); return; }
                contract.save(function (err, contactn) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log('Success!',contactn);
                });
            })
        } else {
            contract.list_payment.push({
                arrival_date: Date.now() +  auction.period * 86400000,
                payment: tong_tien_lai,
            });
            contract.save(function (err, contactn) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log('Success!',contactn);
            });
        }

    }
}

exports.UpdateContractOne = UpdateContractOne;
exports.FindContractOneObj = FindContractOneObj;
exports.createContract = createContract;
exports.create_new_contract = create_new_contract;