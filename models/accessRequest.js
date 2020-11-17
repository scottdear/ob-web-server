const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const vesselCodeRegx = /^S[0-9A-Fa-f]{6}/;
const RequestAccess = mongoose.model('ReqestAccess', new mongoose.Schema({
    user: {
        type: new mongoose.Schema({
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50,
                match: /[A-Za-z]./
            },
            imageUrl: String,
            email: {
                type: String,
                required: true,
                match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            },
            mobileNumber: {
                type: String,
                required: true,
                match: /^(\+\d{1,3}[- ]?)?\d{10}$/
            }
        }),
        required: true
    },
    seaPod: {
        type: new mongoose.Schema({
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                require: true
            },
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            },
            vessleCode: {
                type: String,
                required: true,
                match: vesselCodeRegx,
            }
        }),
        required: true

    },
    type: {
        type: String,
        enum: ['GUEST', 'MEMBER', 'OWNER', 'TENANT', 'ADMIN', 'DEMO'],
        required: true
    },
    period: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['PENDING', 'CANCELED', 'REJECTED', 'ACCEPTED']
    },
    isRecieved: {
        type: Boolean,
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    checkIn: {
        type: Number,
        required: true
    },
    permissionSetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permissions'
    },
}));

function ValidateRequest(request) {
    const schema = Joi.object({
        type: Joi.string().required(),
        period: Joi.number().required(),
        vessleCode: Joi.string().required().regex(vesselCodeRegx),
        checkIn: Joi.number().required()
    });

    return schema.validate(request);
}
exports.RequestAccess = RequestAccess;
exports.ValidateRequest = ValidateRequest;