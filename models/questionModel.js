'use strict';
const mongoose = require('mongoose');
const AnswerSchema = new mongoose.Schema({
    answer: String,
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});

const QuestionSchema = new mongoose.Schema({
    question_group: String,
    title_question: String,
    content_answer: [AnswerSchema],
    no: Number,
    status: {
        type: Number,
        default: 0,
    },
    create_at: {
        type: Number,
        default: Date.now
    },
    updated_at: {
        type: Number
    }
});
module.exports = mongoose.model('questions', QuestionSchema);

