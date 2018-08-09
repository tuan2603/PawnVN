'use strict';
const mongoose = require('mongoose');
const OnlineSchema = new mongoose.Schema({
    user_id:{ // _id người dùng
        type:String,
    },
    socket_id:{ // id socket cua nguoi dung hien tai
        type:String,
    },
    device_token:{ // device_token cua nguoi dung hien tai
        type:String,
    },
    isPlatform:{ //thiết bị sử dụng. 0 ios, 1 android, 2 web
        type:Number,
        default:2,
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});

module.exports = mongoose.model('onlines', OnlineSchema);

