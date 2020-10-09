const mongoose = require('mongoose');

const SeaPodConfig = mongoose.model('SeaPodConfig', new mongoose.Schema({
    model: {
        type: String,
        required: true
    },
    rooms: [{
        label: {
            type: String,
            required: true
        },
        type: {
            type: String,
        },
        lightsConfig: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LightConfig'
        },
    }],
}));

exports.SeaPodConfig = SeaPodConfig;