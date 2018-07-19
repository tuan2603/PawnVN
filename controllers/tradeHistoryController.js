'use strict';
const TradeHistory = require('../models/tradeHistoryModel');

/*
* tìm lịch sử theo accountID
* */
let FindTradeHistoryID = (obj) => {
    return new Promise((resolve, reject) => {
        TradeHistory.find(obj, function (err, history) {
            if (err) return reject(err);
            resolve(history);
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

exports.find_all_history = function (req, res) {
    if ( req.body.accountID === undefined )  {
        return res.json({
            response: false,
            value: "not find params "
        })
    }
    let {accountID} = req.body;
    FindTradeHistoryID({accountID:accountID})
        .then(
            hisf => {
                if (hisf) {
                    return res.json({
                        response: true,
                        value: hisf
                    })
                } else {
                    return res.json({
                        response: false,
                        value: "không tìm thấy"
                    })
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
