'use strict';
const PawnAuction = require('../models/auctionPawnModel');

/*
* tìm tất cả các document có cùng pawnID
* */
let FindPawnAuctionPawnID = (pawnID) => {
    return new Promise((resolve, reject) => {
        PawnAuction.find({
            pawnID:pawnID,
            }, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};

/*
* tìm 1 document qua _id
* */
let FindPawnAuctionID = (_id) => {
    return new Promise((resolve, reject) => {
        PawnAuction.findOne({
            _id:_id,
            }, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};

/*
*  function tạo mới 1 document đấu giá cầm đồ,
* */
let createPawnAuction = (pawnAuction) => {
    return new Promise((resolve, reject) => {
        pawnAuction.save(function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};

/*
*  function tìm và update
* dựa vào id
* */
let updatePawnAuction = (id,obj) => {
    return new Promise((resolve, reject) => {
        PawnAuction.findOneAndUpdate({_id: id}, obj, {new: true}, function (err, pa) {
            if (err) reject(err);
            resolve(pa);
        });
    });
}

/*
*  tìm tất cả các document có cùng pawnID
* Api: /api/pawn-auction/list
* method: post
* */
exports.find_pawn_auction_pawn_id = function (req, res) {
    FindPawnAuctionPawnID(req.body.pawnID)
        .then(
            pawn_auction => {
                if (pawn_auction){
                    return res.json({
                        value: pawn_auction,
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
* Api: /api/pawn-auction
* method: get
* */
exports.find_pawn_auction_id = function (req, res) {
    FindPawnAuctionID(req.params.id)
        .then(
            pawn_auction => {
                if (pawn_auction){
                    return res.json({
                        value: pawn_auction,
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
* Api: /api/pawn-auction
* method: put
* */
exports.update_pawn_auction_id = function (req, res) {
    updatePawnAuction(req.params.id,req.body)
        .then(
            pawn_auction => {
                if (pawn_auction){
                    return res.json({
                        value: pawn_auction,
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
* Api: /api/pawn-auction
* method: post
* */
exports.insert_pawn_auction = function (req, res) {
    let newPawnAuction = new PawnAuction(req.body);
    newPawnAuction.status = undefined;
    if (newPawnAuction) {
        createPawnAuction(newPawnAuction)
            .then(
                pawn_auction => {
                    if (pawn_auction){
                        return res.json({
                            value: pawn_auction,
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