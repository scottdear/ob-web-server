const mongoose = require('mongoose');

const LightConfig = mongoose.model('LightConfig', new mongoose.Schema({
    label: {
        type: String, 
        required: true 
    },
    compatibleRoomTypes: [String],
    lights: [{
        lightName: {
            type: String,
            required: true
        },
        canChangeColor: {
            type: Boolean,
            required: true
        },
        canChangeIntensity: {
            type: Boolean,
            required: true
        },
    }],
}));

exports.LightConfig = LightConfig;