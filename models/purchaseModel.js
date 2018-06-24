'use strict';
const mongoose = require('mongoose');
const PurchasesSchema = new mongoose.Schema({
    accountID:{ // _id người bán
        type:String,
        lowercase:true,
    },
    name:{ // tên đồ vật bán
        type:String,
        lowercase:true,
    },
    price:{ // giá bán
        type:Number,
        default:0,
    },
    status:{//1 chờ duyệt đấu giá, 2 đã duyệt đấu giá
        type:Number,
        default:1,
    },
    time_out:{ //thời gian hết hạn bán
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
    descriptions:{ //mô tả sản phẩm bán
        type:String,
        lowercase:true,
    },
    purchase_image:{ //hình ảnh sản phẩm bán
        type:String,
        lowercase:true,
    },
    categorizeID:{ // _id loại, nhóm sản phẩm bán
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

module.exports = mongoose.model('purchases', PurchasesSchema);

