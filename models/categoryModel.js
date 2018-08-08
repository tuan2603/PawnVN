'use strict';
const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
    value: String,
    label: String,
    icon: String,
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});
module.exports = mongoose.model('categories', CategorySchema);

