'use strict';
const mongoose = require('mongoose');
const tradeHistorySchema = new mongoose.Schema({
    accountID:{ // _id người dùng
        type:String,
        lowercase:true,
    },
    pricepay:{ // số tiền phải trả
        type:Number,
        default:0,
    },
    description:{ // ghi chú
        type:String,
        lowercase:true,
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});

module.exports = mongoose.model('trade_histories', tradeHistorySchema);

