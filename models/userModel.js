'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const UserSchema = new Schema({
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
    },
    latitude :{ //vĩ độ
        type:Number,
    },
    onlineStatus: {
        type: Boolean
    },
    offlineTime: {
        type: Number
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

