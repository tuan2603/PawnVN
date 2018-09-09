'use strict';
const mongoose = require('mongoose');

const ListPaymentSchema = new mongoose.Schema({
    arrival_date:{ //ngày đến hạng
        type:Number,
    },
    payment:{ //số tiền cần đóng
        type:Number,
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});

const HistoryPaymentSchema = new mongoose.Schema({
    payment_date:{ //ngày đóng lãi
        type:Number,
        default: Date.now
    },
    payment:{ //số tiền đã đóng
        type:Number,
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});


const ContractSchema = new mongoose.Schema({
    _id: String,
    pawn_info:{}, //thông tin pawn
    customer_id:{ // id người vay
        type:String,
    },
    owner_id:{ // id người cho vay
        type:String,
    },
    status:{//0 chưa hoạt động, 1 hoạt động, 2 ngừng hoạt động
        type:Number,
        default:1,
    },
    sign_day: { // ngày ký hợp đồng
        type: Number,
        default: Date.now
    },
    list_payment:[ListPaymentSchema] // lịch thanh toán
    ,
    history_payment:[HistoryPaymentSchema] // lịch sử thanh toán
    ,
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});

module.exports = mongoose.model('contracts', ContractSchema);

