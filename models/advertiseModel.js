'use strict';
const mongoose = require('mongoose');
const AdvertiseSchema = new mongoose.Schema({
    title: String,
    content: String,
    url_image: String,
    status: {
        type: Number,
        default: 0,
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});
module.exports = mongoose.model('advertises', AdvertiseSchema);

