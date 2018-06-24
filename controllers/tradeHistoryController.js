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
let createTradeHistory = (wl) => {
    return new Promise((resolve, reject) => {
        wl.save(function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });
    });
};

/*
*  function insert history theo điều kiện
* */
exports.insert_trade_history =  function(obj){
    let newTrade =  new TradeHistory(obj);
    switch (obj.pricelistID) {
        case "1":
            newTrade.description = " Quý khách đã đăng sản phẩm cầm đồ";
            createTradeHistory(newTrade);
            break;
            case "2":
            newTrade.description = " Quý khách đã đăng sản phẩm để bán";
            createTradeHistory(newTrade);
            break;
            case "3":
            newTrade.description = " Quý khách đã đấu giá 1 cầm đồ";
            createTradeHistory(newTrade);
            break;
            case "4":
            newTrade.description = " Quý khách đã đấu giá 1 mua đồ";
            createTradeHistory(newTrade);
            break;
        default:
    }
};