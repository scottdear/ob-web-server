const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const congfig = require('config');

const tokenAndDevice = require('./tokenAndDevice');
const extendSchema = require('../../helpers/extendSchema');
const personSchema = require('./person');
const emergencyContact = require('./emergencyContact');

const userSchema = extendSchema(personSchema, {
    emergencyContacts: [emergencyContact],
    seaPods: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SeaPods'
    }],
    isVerified: {
        type: Boolean,
        default: true
    },
    accessRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReqestAccess'
    }],
    accessInvitation: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReqestAccess'
    }],
    tokensAndDevices: [tokenAndDevice],
    selectedWeatherSource: {
        type: String,
        enum: ['external','local'],
        default: 'external',
        required: true
    }
});

userSchema.methods.generateAuthToken = function (jti) {
    return jwt.sign({
        _id: this._id,
        role: "NA", //Not Admin
        jti: jti
    }, congfig.get('jwtPrivateKey'));
}

userSchema.methods.generatePasswordToken = function () {
    return jwt.sign({
        _id: this._id
    }, congfig.get('jwtPrivateKey'), {expiresIn: '12h'});
}

userSchema.methods.getUserName = function () {
    return `${this.firstName} ${this.lastName}`
}

const User = mongoose.model('Users', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(50).pattern(/[A-Za-z]./, 'alpha').required(),
        lastName: Joi.string().min(3).max(50).pattern(/[A-Za-z]./, 'alpha').required(),
        email: Joi.string().email().required(),
        mobileNumber: Joi.string().pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/).required(),
        password: Joi.string().pattern(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/).required(),
        country: Joi.string().min(3).max(50).pattern(/[A-Za-z]./, 'alpha').required(),
    });
    return schema.validate(user);
}

function validatePassword(password){
    const schema = Joi.object({
        password: Joi.string().pattern(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/).required(),
    }).unknown();
    return schema.validate(password);
}

exports.User = User;
exports.validateUser = validateUser;
exports.validatePassword = validatePassword;