'use strict';
const mongoose = require('mongoose');

const Comments = new mongoose.Schema({
    accountID: {
        type: String,
    },
    phone: {
        type: Number,
    },
    fullName: {
        type: String,
        trim: true,
        default: "",
    },
    sex: { // giới tính
        type: String, // 0 nam, 1 nữ, 2 khác
    },
    avatarLink: {
        type: String,
        lowercase: true
    },
    status: {
        type: Number,
        default: 0,
    },
    rating_star: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
    },
    body: {
        type: String,
        default:""
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

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
        default: "",
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
    comments: [Comments],
    accept: { // phê duyệt, nếu là true là đã xác thực toàn bộ hồ sơ. business có quyền hoạt động, nếu false thì giống như người dùng thường
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
    categories: { // loại cầm đồ
        type: [],
    },
    sex: { // giới tính
        type: String, // 0 nam, 1 nữ, 2 khác
    },
    birthday: { // ngày sinh
        type: Number,
    },
    licenseeImageFront: { // ảnh giấy phép kinh doanh mặt trước
        type: String,
        lowercase: true,
    },
    licenseeImageBehind: { //ảnh giấy phép kinh doanh mặt sau
        type: String,
        lowercase: true,
    },
    companyName: { // Tên công ty, doanh nghiệp
        type: String
    },
    businessNumber: { //số đăng ký doanh nghiệp
        type: String
    },
    representativeName: { //tên người đại diện
        type: String
    },
    title: { // chức danh
        type: String
    },
    businessDate: {  //ngày cấp
        type: Number
    },
    licensee: { // nơi cấp
        type: String
    },
    address: { // địa chỉ công ty
        type: String
    },
    city: { // tỉnh thành phố
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


module.exports = mongoose.model('User', UserSchema);

