'use strict';
const city = require('../models/cityModel');

exports.insert_many = function (req, res) {
    city.insertMany(req.body,function (err,city) {
        if (err) return res.send({
            response:false,
            value:err,
        });
        res.send({
            response:true,
            value:city,
        })
    })
};

exports.list_city = function (req, res) {
    city.find({},function (err,city) {
        if (err) return res.send({
            response:false,
            value:err,
        });
        res.send({
            response:true,
            value:city,
        })
    })
};

