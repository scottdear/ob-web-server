const express = require('express');
const router = express.Router();
const _ = require('lodash');

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const cros = require('../middlewares/accessControlAllowOrigin');
const AdminService = require('../services/admin');
const { validate } = require('../models/users/admin');
const { validateTotpToken, ValidateAuthCredentials } = require('../services/validation');

router.post('/registration', cros, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "registration data are required!"
    });

    const { error } = validate(req.body);
    if (error) return res.status(400).json({ "message": error.details[0].message });

    const contextObject = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        mobileNumber: req.body.mobileNumber,
        password: req.body.password,
        country: req.body.country,
        notificationToken: req.get('notificationToken'),
        hardwareId: req.get('hardwareId'),
        model: req.get('model')
    }
    const adminService = new AdminService();
    const result = await adminService.createAdmin(contextObject);

    if (result.isError) return res.status(result.statusCode).json({ 'message': result.error });
    return res.header('x-auth-token', result.jwtoken).status(200).json(result.admin);
});

router.put('/auth', cros, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "email and password are required!"
    });

    const { error } = ValidateAuthCredentials(req.body);
    if (error) if (error) return res.status(400).json({ "message": error.details[0].message });

    const contextObject = {
        email: req.body.email,
        password: req.body.password,
        notificationToken: req.get('notificationToken'),
        hardwareId: req.get('hardwareId'),
        model: req.get('model')
    }
    const adminService = new AdminService();
    const result = await adminService.login(contextObject);

    if (result.isError) return res.status(result.statusCode).json({ 'message': result.error });
    return res.header('x-auth-token', result.jwtoken).status(200).json(result.admin);
});

router.get('/me', [auth, admin, cros], async (req, res) => {
    const adminService = new AdminService();
    const result = await adminService.autoLogin(req.user._id);
    if (result.isError) return res.status(result.statusCode).json({ 'message': result.error });

    return res.status(200).json(result.admin);
});

router.post('/totp-verification', async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "secret and token are required!"
    });

    const { error } = validateTotpToken(req.body);
    if (error) if (error) return res.status(400).json({ "message": error.details[0].message });

    const adminService = new AdminService();
    const result = await adminService.verifiyOtp(req.body);

    if (result.isError) return res.status(result.statusCode).json({ 'message': result.error });

    return res.header('x-auth-token', result.jwt).status(200).send(result.admin);
});

module.exports = router;