const mongoose = require('mongoose');

let loginAuditTrial = require('./loginAduitTrial');
const notification = require('./notification');
const actionHistory = require('./actionHistory');
const loginHistory = require('./loginHistory');
const notificationSetting = require('./notificationSetting');

module.exports = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        match: /[A-Za-z]./
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        match: /[A-Za-z]./
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    mobileNumber: {
        type: String,
        required: true,
        match: /^(\+\d{1,3}[- ]?)?\d{10}$/
    },
    password: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        match: /[A-Za-z]./
    },
    
    loginAuditTrials: [loginAuditTrial],
    notifications: [notification],
    actionHistorys: [actionHistory],
    previousPasswords: [String],
    resetPasswordToken: {type:String},
    resetPasswordExpires: {type:Date},
    loginHistory: [loginHistory],
    profileImageUrl:{type:String,default:""},
    notificationSettings: [notificationSetting],
});