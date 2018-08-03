'use strict';
const mongoose = require('mongoose');
const TermsSchema = new mongoose.Schema({
    title: String,
    content: String,
    Created: {
       type: Number,
        default:Date.now,
    },
    Updated: Number,
});
module.exports = mongoose.model('terms', TermsSchema);

