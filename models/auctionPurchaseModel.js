'use strict';
const mongoose = require('mongoose');
const AuctionPurchasesSchema = new mongoose.Schema({
    accountID:{ // _id người mua
        type:String,
        lowercase:true,
        required: true,
    },
    purchaseID:{ // _id sản phẩm mua
        type:String,
        lowercase:true,
        required: true,
    },
    price:{ // giá muốn mua
        type:Number,
        default:0,
    },
    status:{//1 chờ duyệt đấu giá mua, 2 đã duyệt đấu giá mua
        type:Number,
        default:1,
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});

module.exports = mongoose.model('auction_purchases', AuctionPurchasesSchema);

