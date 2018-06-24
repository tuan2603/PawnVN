'use strict';
const PurchaseAuction = require('../models/auctionPurchaseModel');

/*
* tìm tất cả các document có cùng purchaseID
* */
let FindPurchaseAuctionPurchaseID = (purchaseID) => {
    return new Promise((resolve, reject) => {
        PurchaseAuction.find({
            purchaseID:purchaseID,
            }, function (err, Purchase) {
            if (err) return reject(err);
            resolve(Purchase);
        });
    });
};

/*
* tìm 1 document qua _id
* */
let FindPurchaseAuctionID = (_id) => {
    return new Promise((resolve, reject) => {
        PurchaseAuction.findOne({
            _id:_id,
            }, function (err, Purchase) {
            if (err) return reject(err);
            resolve(Purchase);
        });
    });
};

/*
*  function tạo mới 1 document đấu giá cầm đồ,
* */
let createPurchaseAuction = (purchaseAuction) => {
    return new Promise((resolve, reject) => {
        purchaseAuction.save(function (err, Purchase) {
            if (err) return reject(err);
            resolve(Purchase);
        });
    });
};

/*
*  function tìm và update
* dựa vào id
* */
let updatePurchaseAuction = (id,obj) => {
    return new Promise((resolve, reject) => {
        PurchaseAuction.findOneAndUpdate({_id: id}, obj, {new: true}, function (err, pa) {
            if (err) reject(err);
            resolve(pa);
        });
    });
}

/*
*  tìm tất cả các document có cùng purchaseID
* Api: /api/purchase-auction/list
* method: post
* */
exports.find_purchase_auction_purchase_id = function (req, res) {
    FindPurchaseAuctionPurchaseID(req.body.purchaseID)
        .then(
            purchase_auction => {
                if (purchase_auction){
                    return res.json({
                        value: purchase_auction,
                        response: true
                    });
                }else{
                    return res.json({
                        value: "lưu giá trị bị lỗi",
                        response: false
                    });
                }
            },
            err=>{
                return res.json({
                    value: err,
                    response: false
                });
            }
        )
};

/*
*  tìm một document bởi _id
* Api: /api/purchase-auction
* method: get
* */
exports.find_purchase_auction_id = function (req, res) {
    FindPurchaseAuctionID(req.params.id)
        .then(
            purchase_auction => {
                if (purchase_auction){
                    return res.json({
                        value: purchase_auction,
                        response: true
                    });
                }else{
                    return res.json({
                        value: "lưu giá trị bị lỗi",
                        response: false
                    });
                }
            },
            err=>{
                return res.json({
                    value: err,
                    response: false
                });
            }
        )
};

/*
*  tìm một document bởi _id
* Api: /api/purchase-auction
* method: put
* */
exports.update_purchase_auction_id = function (req, res) {
    updatePurchaseAuction(req.params.id,req.body)
        .then(
            purchase_auction => {
                if (purchase_auction){
                    return res.json({
                        value: purchase_auction,
                        response: true
                    });
                }else{
                    return res.json({
                        value: "lưu giá trị bị lỗi",
                        response: false
                    });
                }
            },
            err=>{
                return res.json({
                    value: err,
                    response: false
                });
            }
        )
};

/*
* insert 1 document
* Api: /api/purchase-auction
* method: post
* */
exports.insert_purchase_auction = function (req, res) {
    let newPurchaseAuction = new PurchaseAuction(req.body);
    newPurchaseAuction.status = undefined;
    if (newPurchaseAuction) {
        createPurchaseAuction(newPurchaseAuction)
            .then(
                purchase_auction => {
                    if (purchase_auction){
                        return res.json({
                            value: purchase_auction,
                            response: true
                        });
                    }else{
                        return res.json({
                            value: "lưu giá trị bị lỗi",
                            response: false
                        });
                    }
                },
                err=>{
                    return res.json({
                        value: err,
                        response: false
                    });
                }
            )
    } else {
        return res.json({
            value: "thông tin không đúng",
            response: false
        });
    }
};