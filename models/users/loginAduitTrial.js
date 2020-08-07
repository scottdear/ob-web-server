const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    deviceModel: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    osModel: {
        type: String,
        required: true
    },
});