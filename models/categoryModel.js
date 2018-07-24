'use strict';
const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
    value: String,
    label: String,
    icon: String,
    Created: {
       type: Number,
        default:Date.now,
    },
    Updated: Number,
});
module.exports = mongoose.model('categories', CategorySchema);

