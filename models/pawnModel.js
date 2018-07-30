'use strict';
const mongoose = require('mongoose');

const AuctionPawnSchema = new mongoose.Schema({
    accountID:{ // _id người đấu giá
        type:String,
        lowercase:true,
        required: true,
    },
    price:{ // giá người đấu đưa ra
        type:Number,
        default:0,
    },
    status:{
        type:Number,
        default:0,
    },
    interest_rate:{ //lãi xuất do người đấu giá đưa ra
        type:Number,
        default:0,
    },
    period:{ //kỳ hạn đóng lãi
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

const reciver = new mongoose.Schema({
    _id:{ // _id nhận được pawn
        type:String,
    },
});

const PawnSchema = new mongoose.Schema({
    accountID:{ // _id người đăng
        type:String,
        lowercase:true,
    },
    name:{ // tên đồ vật đấu giá
        type:String,
    },
    adress:{ // địa chỉ
        type:String,
        lowercase:true,
    },
    pawn_image:{ //hình ảnh sản phẩm đấu giá
        type:String,
        lowercase:true,
    },
    categorizeID:{ // _id loại, nhóm sản phẩm
        type:String,
        lowercase:true,
    },
    price:{ // giá đấu ban đầu
        type:Number,
        default:0,
    },
    status:{//1 chờ duyệt đấu giá, 2 đã duyệt đấu giá
        type:Number,
        default:1,
    },
    deleted:{// false view,  true not view
        type:Boolean,
        default:true,
    },
    time_out:{ //thời gian hết hạn đấu giá
        type:Number,
        default:Date.now,
    },
    date_time:{ // thời hạn
        type:Number,
        default:0,
    },
    timer:{ //thời gian hẹn gặp
        type:Number,
        default:Date.now,
    },
    longitude:{ //kinh độ
        type:Number,
    },
    latitude :{ //vĩ độ
        type:Number,
    },
    descriptions:{ //mô tả sản phẩm đấu giá
        type:String,
        lowercase:true,
    },
    auction:[AuctionPawnSchema],
    reciver:[reciver],
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});

module.exports = mongoose.model('pawns', PawnSchema);

