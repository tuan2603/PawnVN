// models/sockets.js
// load the things we need
const mongoose = require('mongoose');

// define the schema for our user model
const clientSchema = mongoose.Schema({
    socket: Map,
    socket_id: String,
});

// create the model for users and expose it to our app
module.exports = mongoose.model('clients_sockets', clientSchema);