'use strict';
const mongoose = require('mongoose');
const AuctionPawnSchema = new mongoose.Schema({
    accountID:{ // _id người đấu giá
        type:String,
        lowercase:true,
        required: true,
    },
    pawnID:{ // _id sản phẩm đấu giá
        type:String,
        lowercase:true,
        required: true,
    },
    price:{ // giá người đấu đưa ra
        type:Number,
        default:0,
    },
    status:{//1 chờ duyệt đấu giá, 2 đã duyệt đấu giá
        type:Number,
        default:1,
    },
    interest_rate:{ //lãi xuất do người đấu giá đưa ra
        type:Number,
        default:0,
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});

module.exports = mongoose.model('auction_pawns', AuctionPawnSchema);

