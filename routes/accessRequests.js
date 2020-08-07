const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const _ = require('lodash');
const {
    validateObjectId,
    validateAcceptAccessRequest,
    validateEmailAddress
} = require('../services/validation');
const { validateUser } = require('../models/users/user');
const { ValidateRequest } = require('../models/accessRequest');
const attachAccessRequestListner = require('../subscribers/accessManagement');

const eventEmitter = new (require('events').EventEmitter)();
const accessManagement = new (require('../services/accessManagement'))(eventEmitter);

attachAccessRequestListner(eventEmitter);

router.get('/user', auth, async (req, res) => {
    const result = await accessManagement.getAccessbyUser(req.user._id);

    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });

    return res.status(200).send(result.access);
});

router.get('/:id', auth, async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).json({
        "message": error.message
    })

    const result = await accessManagement.getAccessRequestById(req.params.id);

    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });

    return res.status(200).send(result.request);
});

router.post('/new', async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "user and request data are required"
    });

    const userValidationResult = validateUser(req.body.user);
    if (userValidationResult.error) return res.status(400).json({
        'message': userValidationResult.error.message
    });

    const requestValidationResult = ValidateRequest(req.body.request);
    if (requestValidationResult.error) return res.status(400).json({
        'message': requestValidationResult.error.message
    });

    const contextObject = {
        jt: req.jt,
        request: req.body.request,
        user: {
            userData: req.body.user,
            notificationToken: req.get('notificationToken'),
            hardwareId: req.get('hardwareId'),
            model: req.get('model')
        }
    }
    const result = await accessManagement.requestAccessNewUser(contextObject);

    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });

    return res.header("x-auth-token", req.jt).send(result.request);
});

router.post('/existing', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "request is required"
    });

    const requestValidationResult = ValidateRequest(req.body);
    if (requestValidationResult.error) return res.status(400).json({
        'message': requestValidationResult.error.message
    });

    const contextObject = {
        user: req.user,
        body: req.body
    }
    const result = await accessManagement.requestAccessExistenceUser(contextObject);

    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });

    return res.status(200).send(result.request);
});

router.put('/:id', auth, async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).json({
        "message": error.message
    })
    const result = await accessManagement.cancelAccessRequest(req.params.id, req.user._id);

    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });

    return res.status(200).send(result.accessRequest);
});

router.put('/:id/rejection', auth, async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).json({
        "message": error.message
    })
    const result = await accessManagement.rejectAccessRequest(req.params.id, req.user._id);

    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });

    return res.status(200).send(result.accessRequest);
});

router.put('/:id/approval', auth, async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).json({
        "message": error.details[0].message
    });

    const acceptBody = validateAcceptAccessRequest(req.body);
    if (acceptBody.error) return res.status(400).json({
        "message": acceptBody.error.details[0].message
    });

    const result = await accessManagement.acceptAccessRequest(req.params.id, req.body, req.user._id);

    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });

    return res.status(200).send(result.accessRequest);
});

router.post('/invitations/:id', auth, async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).json({
        "message": error.details[0].message
    });

    const isValidEmail = validateEmailAddress(req.body);
    if (isValidEmail.error) return res.status(400).json({
        "message": isValidEmail.error.details[0].message
    });

    const result = await accessManagement.addMembers(req.body, req.user._id, req.params.id);

    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });

    return res.status(200).send(result.invitation);
});

router.put('/invitations/:id/approval', auth, async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).json({
        "message": error.details[0].message
    });

    const result = await accessManagement.acceptAccessInvitation(req.params.id, req.user._id);
    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });

    return res.status(200).send(result.accessRequest);
});

router.put('/invitations/:id/rejection', auth, async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).json({
        "message": error.details[0].message
    });

    const result = await accessManagement.rejectAccessInvitation(req.params.id, req.user._id);
    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });

    return res.status(200).send(result.accessRequest);
});

router.put('/invitations/:id', auth, async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).json({
        "message": error.details[0].message
    });

    const result = await accessManagement.cancelAccessInvitation(req.params.id, req.user._id);
    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });

    return res.status(200).send(result.accessRequest);
});

module.exports = router