'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const CitySchema = new Schema({
    Type: Number,
    SolrID: String,
    ID: Number,
    Title: String,
    STT: Number,
    Created: {
       type: Number,
        default:Date.now,
    },
    Updated: Number,
});


module.exports = mongoose.model('cities', CitySchema);

