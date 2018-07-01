'use strict';
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
    },
    countryCode: {
        type: Number,
    },
    phone: {
        type: Number,
    },
    email: {
        type: String,
        lowercase: true,
    },
    password: {
        type: String
    },
    activeType: {
        type: Number, // 0 not active, 1 active
        default: 0
    },
    roleType: {
        type: Number, // 1 user, 2 PAWNOWNER, 0 admin
        default: 1
    },
    verifyType: {
        type: Number,
        default: 0 // 0: mail, 1 phone, 2 password
    },
    avatarLink: {
        type: String,
        lowercase: true
    },
    longitude:{ //kinh độ
        type:Number,
        default:106.698944,
    },
    latitude :{ //vĩ độ
        type:Number,
        default:10.779807,
    },
    socket_id: { //id socket
        type: String,
        lowercase: true,
        default:"",
    },
    device_token: { //token dien thoai
        type: String,
        lowercase: true,
        default:"",
    },
    isPlatform:{ //thiết bị sử dụng. 0 ios, 1 android
        type:Number,
        default: 0,
    },
    offlineTime: { // = 0  là ofline,  > 1530197907824 là online
        type: Number,
        default: 0,
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number,
        default: Date.now
    }
});


module.exports = mongoose.model('User', UserSchema);

