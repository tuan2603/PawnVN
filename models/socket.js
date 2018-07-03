// models/sockets.js
// load the things we need
const mongoose = require('mongoose');

// define the schema for our user model
var socketSchema = mongoose.Schema({
    method: String,
    address: String,
    params: String,
    description: String,
});

// create the model for users and expose it to our app
module.exports = mongoose.model('sockets', socketSchema);
