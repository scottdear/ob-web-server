const mongoose = require('mongoose');

const Log = mongoose.model('Log', new mongoose.Schema({
    timestamp: {
        type: Date
    },
    level: {
        type: String
    },
    message: {
        type: String
    }
}));

exports.Log = Log;