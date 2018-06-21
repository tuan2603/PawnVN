'use strict';
const mongoose = require('mongoose');
const UserDocSchema = new mongoose.Schema({
    accountID: { // user id
        type: String
    },
    accept: { // phê duyệt
        type: Boolean,
        default:false
    },
    identityCardFront: { // chứng minh nhân dân mặt trước
        type: String,
        lowercase: true,
    },
    identityCardBehind: { // chứng minh nhân dân mặt sau
        type: String,
        lowercase: true,
    },
    identityCardNumber: { // số chứng minh nhân dân
        type: Number
    },
    identityCardDateIssued: { // ngày cấp
        type: Date
    },
    products: { // loại cầm đồ
        type: [],
    },
    sex: { // giới tính
        type: String, // 0 nam, 1 nữ, 2 khác
    },
    birthday: { // ngày sinh
        type: Number,
    },
    city: { // tỉnh thành phố
        type: String
    },
    companyName: { // Tên công ty, doanh nghiệp
        type: Number
    },
    address: { // địa chỉ công ty
        type: String
    },
    businessNumber: { //số đăng ký doanh nghiệp
        type: String
    },
    businessDate: {  //ngày cấp
        type: Number
    },
    licensee: { // nơi cấp
        type: String
    },
    licenseeImageFront: { // ảnh giấy phép kinh doanh mặt trước
        type: String,
        lowercase: true,
    },
    licenseeImageBehind: { //ảnh giấy phép kinh doanh mặt sau
        type: String,
        lowercase: true,
    },
    representativeName: { //tên người đại diện
        type: String
    },
    title: { // chức danh
        type: String
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


module.exports = mongoose.model('userdocs', UserDocSchema);

