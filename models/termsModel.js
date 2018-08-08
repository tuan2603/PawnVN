'use strict';
const mongoose = require('mongoose');
const TermsSchema = new mongoose.Schema({
    title: String,
    content: String,
    categories: [],
    author:{},
    permalink: String,
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});
module.exports = mongoose.model('terms', TermsSchema);

