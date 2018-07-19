'use strict';
const TradeHistory = require('../models/tradeHistoryModel');


/*
* tìm giá theo accountID
* */
let FindTradeHistoryID = (accountID) => {
    return new Promise((resolve, reject) => {
        TradeHistory.findOne({accountID:accountID}, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};

/*
*  function tạo mới 1 một TradeHistory cho người dùng
* */
let CreateTradeHistory = (obj) => {
    return new Promise((resolve, reject) => {
        let newHis = new TradeHistory(obj);
        newHis.save(function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });
    });
};
exports.CreateTradeHistory = CreateTradeHistory;
