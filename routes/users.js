const express = require('express');
const router = express.Router();
const _ = require('lodash');
const path = require('path');
const bodyParser = require('body-parser');

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

const {
    ValidatePassword,
    ValidateUserUpdateData,
    validateEmergencyContacts,
    validateObjectId,
    validateNotificationIds
} = require('../services/validation');
const { UserService } = require('../services/user');
const { SeaPodService } = require('../services/seapod');
const NotificationService = require('../services/notification');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));

router.get('/', [auth, admin], async (req, res) => {
    const userService = new UserService();
    const users = await userService.getAllUsers();

    return res.send(users);
});


router.put('/', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "User data required!"
    });

    const { error } = ValidateUserUpdateData(req.body);
    if (error) return res.status(400).json({
        'message': error.message
    });

    const contextObject = {
        userId: req.user._id,
        body: req.body
    }
    const userService = new UserService();
    const result = await userService.updateProfile(contextObject);

    if (result.isError) return res.status(result.statusCode).json({
        'message': result.error
    });

    return res.status(200).json(result.user);
});

router.put('/reset', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Current and new password are required!"
    });

    const { error } = ValidatePassword(req.body);
    if (error) return res.status(400).json({
        'message': error.details[0].message
    });

    const contextObject = {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
        userId: req.user._id,
        notificationToken: req.get('notificationToken'),
        hardwareId: req.get('hardwareId'),
        model: req.get('model')
    }
    const userService = new UserService();
    const result = await userService.updatePassword(contextObject);

    if (result.isError) return res.status(result.statusCode).json({
        'message': result.error
    });

    return res.header('x-auth-token', result.jwtoken).status(200).json({
        "message": "Password updated successfully!"
    });
});

router.put('/forget', async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "User's Email are required!"
    });

    const contextObject = {
        host: req.headers.host,
        email: req.body.email
    }
    const userService = new UserService();
    const result = await userService.forgetPassword(contextObject);

    if (result.isError) return res.status(result.statusCode).json({
        'message': result.error
    });

    return res.status(200).json({
        "message": "An email has been sent to " + req.body.email + " with further instructions"
    });
});

router.get('/reset/:token', async (req, res) => {
    const userService = new UserService();
    const result = await userService.resetPasswordWithToken(req.params.token);

    if (result.isError) return res.status(result.statusCode).sendFile(path.join(__dirname, '/../puplic/invalidToken.html'));

    return res.status(200).sendFile(path.join(__dirname, '/../puplic/resetPassword.html'));
});
router.post('/reset/:token', async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).sendFile(path.join(__dirname, '/../puplic/error.html'));

    const contextObject = {
        token: req.params.token,
        body: req.body
    }
    const userService = new UserService();
    const result = await userService.newPasswordWithToken(contextObject);

    if (result.isError) return res.status(result.statusCode).sendFile(path.join(__dirname, '/../puplic/error.html'));

    return res.status(200).sendFile(path.join(__dirname, '/../puplic/success.html'));
});
router.get('/reset/js/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/../puplic/js/script.js'));
});
router.get('/reset/css/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, '/../puplic/css/style.css'));
});

router.get('/notifications', auth, async (req, res) => {
    const userService = new UserService();
    const result = await userService.getuserNotifications(req.user._id);

    if (result.isError) return res.status(result.statusCode).json({
        'message': result.error
    });

    return res.status(200).json(result.notifications);
});

router.put('/notifications/settings', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Notification Settings are required!"
    });

    const notificationService = new NotificationService();
    const result = await notificationService.updateNotificationSettings(req.user._id, req.body);
    if (result.isError) return res.status(result.statusCode).json({
        'message': result.error
    });

    return res.status(200).json(result.notificationData);
});

router.put('/notifications', auth, async (req, res) => {
    const { error } = validateNotificationIds(req.body);
    if (error) return res.status(400).json({
        'message': error.details[0].message
    });

    const notificationService = new NotificationService();
    const result = await notificationService.updateAllNotificationSeenStatus(req.body.notificationIds, req.user._id);
    if (result.isError)
        return res.status(result.statusCode).json({
            'message': result.error
        });

    return res.status(200).json(result.notificationData);
});

router.put('/notifications/:notificationId', auth, async (req, res) => {
    const { error } = validateObjectId(req.params.notificationId);
    if (error) return res.status(400).json({
        'message': error.message
    });

    const notificationService = new NotificationService();
    const result = await notificationService.updateNotificationSeenStatus(req.params.notificationId, req.user._id);
    if (result.isError) return res.status(result.statusCode).json({
        'message': result.error
    });

    return res.status(200).json(result.notificationData);
});

router.get('/me/seapods', auth, async (req, res) => {
    const seaPodService = new SeaPodService();
    const result = await seaPodService.getUserSeapods(req.user._id);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });

    return res.send(result.seaPods);
});

router.put('/emergency-contacts', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Emergency Contacts data required!"
    });

    const { error } = validateEmergencyContacts(req.body);
    if (error) return res.status(400).json({
        'message': error.message
    });

    const userService = new UserService();
    const result = await userService.addEmergencyContatact(req.user._id, req.body);
    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });

    return res.send(result.emergencyContacts);
});

router.put('/emergency-contacts/:id', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Emergency Contacts data required!"
    });

    const objectIdValiation = validateObjectId(req.params.id);
    if (objectIdValiation.error) return res.status(400).json({
        'message': objectIdValiation.error.message
    });

    const { error } = validateEmergencyContacts(req.body);
    if (error) return res.status(400).json({
        'message': error.message
    });

    const userService = new UserService();
    const result = await userService.updateUserEmergencyContact(req.user._id, req.params.id, req.body);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });

    return res.send(result.emergencyContacts);
});

router.delete('/emergency-contacts/:id', auth, async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).json({
        'message': error.message
    });

    const userService = new UserService();
    const result = await userService.deleteUserEmergencyContact(req.user._id, req.params.id);
    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });

    return res.send(result.emergencyContacts);
});

router.post('/logout', auth, async (req, res) => {
    const userService = new UserService();
    const result = await userService.invalidateToken(req.user._id, req.user.jti);
    //await userService.invalidateAllToken(req.user._id);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.send(result.message);
});

module.exports = router;