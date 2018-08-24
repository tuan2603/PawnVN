'use strict';
const mongoose = require('mongoose');
const MarketDataSchema = new mongoose.Schema({
    price: Number,
    status: {
        type: Number,
        default: 1,
    },
    pawn: {
        type: Object,
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});
module.exports = mongoose.model('market_datas', MarketDataSchema);

