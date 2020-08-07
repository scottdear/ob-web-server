const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        required: true,
        default: false
    },
    data: {
        type: Object,
        required: true,
        default: {}
    },
    priority: {
        type: Number,
        required: true,
        default: 0
    }
});