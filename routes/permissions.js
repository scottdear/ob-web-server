const express = require('express');
const _ = require('lodash');
const auth = require('../middlewares/auth');
const { PermissionService } = require('../services/permission');
const { validateObjectId, validatePermissionName } = require('../services/validation');

const router = express.Router();

router.post('/:seapodId', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "permission data is required!"
    });

    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid Seapod ID!"
    });

    const { error } = validatePermissionName(req.body);
    if (error) return res.status(400).json({
        'message': error.message
    });

    const permissionService = new PermissionService();
    const result = await permissionService.addNewPermission(req.params.seapodId, req.user._id, req.body);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.status(result.statusCode).json(result.permission);
});

router.put('/:seapodId', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "permission data is required!"
    });

    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid Seapod ID!"
    });

    const { error } = validatePermissionName(req.body);
    if (error) return res.status(400).json({
        'message': error.message
    });

    const permissionService = new PermissionService();
    const result = await permissionService.updatePermission(req.params.seapodId, req.user._id, req.body);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.status(result.statusCode).json(result.permission);
});

router.put('/:permissionId/seapod/:seapodId/name', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Permission name is required!"
    });

    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid Seapod ID!"
    });

    const permissionIdError = validateObjectId(req.params.permissionId);
    if (permissionIdError.error) return res.status(400).json({
        "message": "Invalid Permission ID!"
    });

    const { error } = validatePermissionName(req.body);
    if (error) return res.status(400).json({
        'message': error.message
    });

    const permissionService = new PermissionService();
    const result = await permissionService.updatePermissionName(req.params.permissionId, req.body.Name, req.params.seapodId, req.user._id);

    if (result.isError) return res.status(result.statusCode).send({
        "message": result.error
    });
    return res.send(result.updatePermisson);
});

router.delete('/:permissionId/seapod/:seapodId', auth, async (req, res) => {
    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid Seapod ID!"
    });

    const permissionIdError = validateObjectId(req.params.permissionId);
    if (permissionIdError.error) return res.status(400).json({
        "message": "Invalid Permission ID!"
    });

    const permissionService = new PermissionService();
    const result = await permissionService.deletePermission(req.params.permissionId, req.params.seapodId, req.user._id);

    if (result.isError) return res.status(result.statusCode).send({
        "message": result.error
    });
    return res.send(result.permission);
});

router.put('/:seapodId/user', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Data is required!"
    });

    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid Seapod ID!"
    });

    const userIdError = validateObjectId(req.body.userId);
    if (userIdError.error) return res.status(400).json({
        "message": "Invalid User ID!"
    });

    const permissionIdError = validateObjectId(req.body.permissionId);
    if (permissionIdError.error) return res.status(400).json({
        "message": "Invalid Permission ID!"
    });

    const permissionService = new PermissionService();
    const result = await permissionService.updatePermissionSet(req.params.seapodId, req.body.userId, req.body.permissionId, req.user._id);

    if (result.isError) return res.status(result.statusCode).send({
        "message": result.error
    });
    return res.send(result.user);
});

router.delete('/:seapodId/user', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Data is required!"
    });

    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid Seapod ID!"
    });

    const userIdError = validateObjectId(req.body.userId);
    if (userIdError.error) return res.status(400).json({
        "message": "Invalid User ID!"
    });

    const permissionService = new PermissionService();
    const result = await permissionService.revokePermissionSet(req.params.seapodId, req.body.userId, req.user._id);

    if (result.isError) return res.status(result.statusCode).send({
        "message": result.error
    });
    return res.send(result.user);
});

router.get('/:seapodId/seapod', auth, async (req, res) => {
    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid Seapod ID!"
    });

    const permissionService = new PermissionService();
    const result = await permissionService.getSeapodPermissionSets(req.params.seapodId);

    if (result.isError) return res.status(result.statusCode).send({
        "message": result.error
    });
    return res.send(result.permission);
});

router.get('/:permissionId', auth, async (req, res) => {
    const permissionIdError = validateObjectId(req.params.permissionId);
    if (permissionIdError.error) return res.status(400).json({
        "message": "Invalid Permission ID!"
    });

    const permissionService = new PermissionService();
    const result = await permissionService.getPermissionSet(req.params.permissionId);

    if (result.isError) return res.status(result.statusCode).send({
        "message": result.error
    });
    return res.send(result.permission);
});

module.exports = router;