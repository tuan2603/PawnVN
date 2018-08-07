'use strict';
const mongoose = require('mongoose');
const TermsSchema = new mongoose.Schema({
    categories: String,
    title: String,
    content: String,
    accountID: String,
    Created: {
       type: Number,
        default:Date.now,
    },
    Updated: Number,
});
module.exports = mongoose.model('terms', TermsSchema);

