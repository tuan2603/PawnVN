'use strict';
const mongoose = require('mongoose');
const PricelistSchema = new mongoose.Schema({
    _id:{ // _id bảng giá
        type:String,
        lowercase:true,
        required: true,
    },
    name:{ // tên danh mục giá
        type:String,
        lowercase:true,
    },
    price:{ // giá sản phẩm
        type:Number,
        default:0,
    },
    description:{ // ghi chú
        type:String,
        lowercase:true,
    },
    date_time:{ // thời hạn
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

module.exports = mongoose.model('pricelist', PricelistSchema);

