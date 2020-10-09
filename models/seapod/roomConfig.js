const mongoose = require('mongoose');

const RoomConfig = mongoose.model('RoomConfig', new mongoose.Schema({
    label: {
        type: String, 
        required: true 
    },
    compatibleRoomTypes: [String],
    lights: [{
        label: {
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

exports.RoomConfig = RoomConfig;