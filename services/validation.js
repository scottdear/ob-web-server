const Joi = require('@hapi/joi');

exports.ValidateAuthCredentials = function (credentials) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/).required(),
    });

    return schema.validate(credentials);
}

exports.ValidatePassword = function (passwords) {
    const passwordPattern = /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/;
    const schema = Joi.object({
        currentPassword: Joi.string().pattern(passwordPattern).required(),
        newPassword: Joi.string().pattern(passwordPattern).required()
    });

    return schema.validate(passwords);
}

exports.ValidateUserUpdateData = function (user) {
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(50).pattern(/[A-Za-z]./, 'alpha').required(),
        lastName: Joi.string().min(3).max(50).pattern(/[A-Za-z]./, 'alpha').required(),
        email: Joi.string().email().required(),
        mobileNumber: Joi.string().pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/).required(),
        country: Joi.string().min(3).max(50).pattern(/[A-Za-z]./, 'alpha').required(),
    });

    return schema.validate(user);
}


exports.validateTotpToken = function (totpToken) {
    const schema = Joi.object({
        secret: Joi.string().min(32).max(32).required(),
        token: Joi.number().integer().required()
    });

    return schema.validate(totpToken);
}


exports.validateObjectId = function (objectId) {

    const schema = Joi.object({
        id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    });

    return schema.validate({ "id": objectId });
}

exports.validateSeapdName = function (seapodName) {
    const schema = Joi.object({
        seapodName: Joi.string().min(5).max(50).required()
    });

    return schema.validate(seapodName);
}

exports.validatePermissionName = function (permissionName) {
    const schema = Joi.object({
        Name: Joi.string().min(5).max(50).required()
    }).unknown();

    return schema.validate(permissionName);
}

exports.validateEmergencyContacts = function (emergencyContact) {
    const schema = Joi.object({
        _id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
        firstName: Joi.string().min(3).max(50).pattern(/[A-Za-z]./, 'alpha').required(),
        lastName: Joi.string().min(3).max(50).pattern(/[A-Za-z]./, 'alpha').required(),
        email: Joi.string().email().required(),
        mobileNumber: Joi.string().pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/).required(),
    });

    return schema.validate(emergencyContact);
}

exports.validateAcceptAccessRequest = function (requestAccessTypeAndTime) {
    const schema = Joi.object({
        type: Joi.string().valid('MEMBER', 'GUEST', 'OWNER'),
        period: Joi.number()
    }).unknown();

    return schema.validate(requestAccessTypeAndTime);
}

exports.validateEmailAddress = function (email) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
    }).unknown();

    return schema.validate(email);
}

exports.validateNotificationIds = function (notificationIds) {
    const schema = Joi.object({
        notificationIds: Joi.array().items(Joi.string()),
    });

    return schema.validate(notificationIds);
}