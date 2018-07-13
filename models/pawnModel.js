'use strict';
const mongoose = require('mongoose');
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
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});

module.exports = mongoose.model('pawns', PawnSchema);

