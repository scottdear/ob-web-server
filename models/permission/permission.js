const mongoose = require('mongoose');

const Permission = mongoose.model('Permissions', new mongoose.Schema({
    Name: { 
        type: String, 
        required: true,
        minlength: 5,
        maxlength: 50
    },
    Sets: [{
        Name: {
            type: String,
            required: true,
        },
        Permissions: [{
            Name: {
                type: String,
                required: true,
            },
            Status: {
                type: String, 
                enum: ['ON','OFF','EMERGENCY'], 
                default: 'OFF' 
            },
        }]
    }],
    isDefault: { 
        type: Boolean, 
        default: false 
    },
}));

exports.Permission = Permission;