'use strict';
const category = require('../models/categoryModel');

exports.insert_one = function (req, res) {
    console.log("aa",req.body);
    let newCat = new category(req.body);
    newCat.save(function (err,categories) {
        if (err) return res.send({
            respone:false,
            value:err,
        });
        res.send({
            respone:true,
            value:categories,
        })
    })
};

exports.list_categories = function (req, res) {
    category.find({},function (err,categories) {
        if (err) return res.send({
            respone:false,
            value:err,
        });
        res.send({
            respone:true,
            value:categories,
        })
    })
};

