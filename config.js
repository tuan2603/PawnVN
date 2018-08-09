require('dotenv').config();
const path = require('path');
module.exports = {
    'secret': process.env.SECRET,
    'bearer': process.env.BEARER,
    'database': process.env.MONGO_URL_PAWN,
    'AUrl': process.env.port || 8080,
    'API_KEY': process.env.NEXMO_API_KEY,
    'API_SECRET': process.env.NEXMO_API_SECRET,
    'API_SECRET_SPEEDSMS': process.env.SPEEDSMS_API_SECRET,
    'NUMBER': 84975227856,
    'folder_temp': path.join(__dirname, 'public', 'temps'),
    'folder_uploads': path.join(__dirname, 'public', 'uploads'),
    'distance_config': 20.0,
    'server_socket': 'http://localhost:8080',
};
