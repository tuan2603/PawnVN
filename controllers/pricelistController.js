'use strict';
const Pricelist = require('../models/pricelistModel');

const Wallets = require('../controllers/walletsController');
/*
* tìm tất cả các bảng giá
* */
let FindPricelistAll = () => {
    return new Promise((resolve, reject) => {
        Pricelist.find({}, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};
/*
* tìm giá theo id
* */
let FindPricelistID = (id) => {
    return new Promise((resolve, reject) => {
        Pricelist.findOne({_id:id}, function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};

/*
*  function tạo mới 1 document giá,
* */
let createPricelist = (pricelist) => {
    return new Promise((resolve, reject) => {
        pricelist.save(function (err, Pawn) {
            if (err) return reject(err);
            resolve(Pawn);
        });
    });
};

/*
*  function tạo mới 1 document đấu giá cầm đồ,
*  api: /api/pricelist
*  tất cả các biến
* */

exports.insert_pricelist = function (req, res) {
    let newPricelist = new Pricelist(req.body);
    newPricelist.status = undefined;
    if (newPricelist) {
        createPricelist(newPricelist)
            .then(
                price_list => {
                    if (price_list){
                        return res.json({
                            value: price_list,
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


/*
*  function tìm giá theo id
* */
exports.find_price_id = function(id){
    FindPricelistID(id)
        .then(
            price => {
                if (price) {
                    return price.price;
                }else{
                    let newPrL = new Pricelist({_id:id, name:" không tìm thấy trong danh sách nên tạo mới"});
                    createPricelist(newPrL);
                    return 0;
                }
            },
            err => {
                return 0;
            }
        )
};

/*
*  function tìm giá theo dịch vụ và so sánh người dùng có đủ tiền để thực hiện giao dịch hay không
* */
exports.find_price_service = function(obj){
    console.log(obj);
    FindPricelistID(obj.id)
        .then(
            Pricel => {
                if (Pricel) {
                    console.log(Wallets.find_one_wallet(obj.accountID,obj.phone), Pricel.price );
                    if(Wallets.find_one_wallet(obj.accountID,obj.phone) >= Pricel.price ){
                        return Pricel;
                    } else {
                        return null;
                    }
                }else{
                    return null;
                }
            },
            err => {
                return null;
            }
        )
};