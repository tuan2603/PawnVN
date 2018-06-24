'use strict';
const mongoose = require('mongoose');
const WalletsSchema = new mongoose.Schema({
    accountID:{ // _id người dùng
        type:String,
        lowercase:true,
        required: true,
        unique: true,
    },
    phone:{ // tài khoản người dùng
        type:Number,
        required: true,
        unique: true,
    },
    balance:{ // tên đồ vật đấu giá
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

module.exports = mongoose.model('Wallets', WalletsSchema);

