'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const CitySchema = new Schema({
    Type: Number,
    SolrID: String,
    ID: Number,
    Title: String,
    STT: Number,
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});


module.exports = mongoose.model('cities', CitySchema);

