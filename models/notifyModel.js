'use strict';
const mongoose = require('mongoose');
const NotifySchema = new mongoose.Schema({
    author:{ // thông tin người gửi
        type:String,
    },
    to_id:{ // _id ngươi gửi
        type:String,
    },
    content:{ // nội dung tin nhắn
        type:String,
    },
    categories:{ // danh mục
        type:String,
    },
    status:{
      type:Number,
      default:0, //0 là chưa xem, 1 là đã xem
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});

module.exports = mongoose.model('notifications', NotifySchema);

