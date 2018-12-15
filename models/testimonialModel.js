const mongoose = require('mongoose');
const TestimonialsSchema = new mongoose.Schema({
    full_name: {
        type: String,
        trim: true,
        default: "",
    },
    avatarLink: {
        type: String,
        lowercase: true
    },
    status: {
        type: Number,
        default: 0,
    },
    content: {
        type: String,
        default:""
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number,
        default: Date.now
    }
});

module.exports = mongoose.model('testimonials', TestimonialsSchema);