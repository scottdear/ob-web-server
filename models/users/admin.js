const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt=require('jsonwebtoken');
const config=require('config');

const extendSchema = require('../../helpers/extendSchema');
const personSchema = require('./person');
const tokenAndDevice = require('./tokenAndDevice');

const adminSchema = extendSchema(personSchema, {
    verificationLevel: {
        type: String,
        enum: ['NOT VERIFIED', 'EMAIL', 'MOBILE'],
        default: 'NOT VERIFIED'
    },
    adminstrationLevel: {
        type: String,
        enum: ['ADMIN', 'MASTER'],
        default: 'ADMIN'
    },
    tokensAndDevices: [tokenAndDevice]
});

function validateAdmin(admin) {
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(50).pattern(/[A-Za-z]./, 'alpha').required(),
        lastName: Joi.string().min(3).max(50).pattern(/[A-Za-z]./, 'alpha').required(),
        email: Joi.string().email().required(),
        mobileNumber: Joi.string().pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/).required(),
        password: Joi.string().pattern(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/).required(),
        country: Joi.string().min(3).max(50).pattern(/[A-Za-z]./, 'alpha').required(),
    });
    return schema.validate(admin);
}

adminSchema.methods.generateAuthToken = function (jti) {
    return jwt.sign({
        _id: this._id,
        role: "A", // Admin
        jti: jti
    }, config.get('jwtPrivateKey'));
}

adminSchema.methods.generateAuthQrCode = async function () {
    const secret = speakeasy.generateSecret({
        name: `${this.firstName} ${this.lastName} @OceanBuilders`,
    });

    const otpAuthUrl = await qrcode.toDataURL(secret.otpauth_url);
    return {
        otpAuthUrl: otpAuthUrl,
        secret: secret.ascii
    };
}

const Admin = mongoose.model('Admins', adminSchema);
exports.Admin = Admin;
exports.validate = validateAdmin;