const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middlewares/auth');

const { validateUser } = require('../models/users/user');
const { validateSeaPod } = require('../models/seapod/seapod');
const { AuthService } = require('../services/auth');
const { ValidateAuthCredentials } = require('../services/validation');

router.post('/', async (req, res) => {
    //TODO: notification token and other token and devices entries(Add Validation)
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "user and sea pod data are required"
    });
    if (_.isEmpty(req.body.user)) return res.status(400).json({
        'message': "user data are required"
    });
    if (_.isEmpty(req.body.seaPod)) return res.status(400).json({
        'message': "seaPod data are required"
    });

    const userValidationResult = validateUser(req.body.user);
    if (userValidationResult.error) return res.status(400).json({
        'message': userValidationResult.error.message
    });

    const seapodValidationResult = validateSeaPod(req.body.seaPod);
    if (seapodValidationResult.error) return res.status(400).json({
        'message': seapodValidationResult.error.message
    });

    const contextObject = {
        host: req.get('host'),
        seapod: req.body.seaPod,
        user: {
            userData: req.body.user,
            notificationToken: req.get('notificationToken'),
            hardwareId: req.get('hardwareId'),
            model: req.get('model')
        }
    }
    const authService = new AuthService();
    const result = await authService.SignUpWithSeaPodCreation(contextObject);

    if (result.isError) return res.status(500).json({
        'message': result.error.message
    });

    return res.header('x-auth-token', result.jwtoken).status(200).json(result.user);
});

router.put('/', async (req, res) => {
    const { error } = ValidateAuthCredentials(req.body);
    if (error) return res.status(400).json({
        'message': 'Your email and password combination was incorrect. Please try again.'
    });

    const contextObject = {
        email: req.body.email,
        password: req.body.password,
        notificationToken: req.get('notificationToken'),
        hardwareId: req.get('hardwareId'),
        model: req.get('model')
    }
    const authService = new AuthService();
    const result = await authService.login(contextObject);

    if (result.isError) return res.status(result.statusCode).json({
        'message': result.error
    });

    return res.header('x-auth-token', result.jwtoken).status(200).json(result.user);
});

router.get('/me', auth, async (req, res) => {
    const authService = new AuthService();
    const result = await authService.autoLogin(req.user._id);

    if (result.isError) return res.status(result.statusCode).json({
        'message': result.error
    });

    return res.status(200).json(result.user);
});

// router.post('/confirmation/:token', async (req, res) => {
//     const token = req.params.token;
//     //TODO: continue here
//     if (token || token.length < 16) return res.status(400).json('invalid token');
//     const userToken = await VerificationToken.findOne({
//         token: token
//     });

//     if (!userToken) return {
//         isError: true,
//         message: "We were unable to find a valid token. Your token my have expired.",
//         type: 'not-verified'
//     };

//     const user = await User.findOne(token._userId);

//     if (!user) return {
//         isError: true,
//         message: "We were unable to find a user for this token."
//     };
//     if (user.isVerified) return {
//         isError: true,
//         message: 'This user has already been verified.',
//         type: 'already-verified'
//     }

//     try {
//         user.isVerified = true;
//         await user.save();
//         return {
//             isError: false,
//             message: "The account has been verified. Please log in."
//         }
//     } catch (error) {

//     }
// });

router.post('/demo', async (req, res) => {
    const contextObject = {
        notificationToken: req.get('notificationToken'),
        hardwareId: req.get('hardwareId'),
        model: req.get('model')
    }
    const authService = new AuthService();
    const result = await authService.demo(contextObject);

    if (result.isError) return res.status(result.statusCode).json({
        'message': result.error
    });

    return res.header('x-auth-token', result.jwtoken).status(200).json(result.user);
});

module.exports = router;