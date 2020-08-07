const express = require('express');
const router = express.Router();
const _ = require('lodash');

const auth = require('../middlewares/auth');
const { validateLightScenes } = require('../models/lightiningScene/lightiningScene');
const { LightiningSceneService } = require('../services/lightiningScene');
const { validateObjectId } = require('../services/validation');

router.post('/:id', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Lightining scenes data is required!"
    });

    const { error } = validateLightScenes(req.body);
    if (error) return res.status(400).json({
        'message': error.message
    });

    const lightiningSceneService = new LightiningSceneService();
    const result = await lightiningSceneService.createLightScne(req.body, req.params.id, req.user._id);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.status(result.statusCode).json(result.lightiningScene);
});

router.put('/:id', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Lightining scenes data is required!"
    });

    const { error } = validateLightScenes(req.body);
    if (error)  return res.status(400).json({
        'message': error.message
    });

    const lightiningSceneService = new LightiningSceneService();
    const result = await lightiningSceneService.updateLightScene(req.body, req.params.id, req.user._id);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.status(result.statusCode).json(result.lightiningScene);

});

router.delete('/:lightSceneId', auth, async (req, res) => {
    const lightSceneIdError = validateObjectId(req.params.lightSceneId);
    if (lightSceneIdError.error) return res.status(400).json({
        "message": "Invalid Light Scene ID!"
    });

    const lightSceneService = new LightiningSceneService();
    const result = await lightSceneService.deleteLightScene(req.params.lightSceneId, req.user._id);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.send(result.lightiningScene);
});

router.put('/order/:seaPodId/:source', auth, async (req, res) => {
    const seaPodIdError = validateObjectId(req.params.seaPodId);
    if (seaPodIdError.error) return res.status(400).json({
        "message": "Invalid Seapod ID!"
    });

    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Lightining scenes data is required!"
    });

    const lightiningSceneService = new LightiningSceneService();
    const result = await lightiningSceneService.updateManyLightScene(req.body, req.user._id, req.params.seaPodId, req.params.source);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.status(result.statusCode).json(result.lightiningScene);
});

router.put('/:seapodId/intensity/:intensity', auth, async (req, res) => {
    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid Seapod ID!"
    });

    const lightiningSceneService = new LightiningSceneService();
    const result = await lightiningSceneService.updateLightSceneIntensity(req.user._id, req.params.seapodId, req.params.intensity);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.status(result.statusCode).json(result.lighting);
});

router.put('/:seapodId/status', auth, async (req, res) => {
    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid Seapod ID!"
    });

    const lightiningSceneService = new LightiningSceneService();
    const result = await lightiningSceneService.updateLightSceneStatus(req.user._id, req.params.seapodId);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.status(result.statusCode).json(result.lighting);
});

router.put('/:seapodId/selected/:lightSceneId', auth, async (req, res) => {
    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid Seapod ID!"
    });

    const lightSceneIdError = validateObjectId(req.params.lightSceneId);
    if (lightSceneIdError.error) return res.status(400).json({
        "message": "Invalid LightScene ID!"
    });

    const lightiningSceneService = new LightiningSceneService();
    const result = await lightiningSceneService.updateSelectedLightScene(req.user._id, req.params.seapodId, req.params.lightSceneId);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.status(result.statusCode).json(result.lighting);
});

router.put('/:lightSceneId/lightIntensity', auth, async (req, res) => {
    const lightSceneIdError = validateObjectId(req.params.lightSceneId);
    if (lightSceneIdError.error) return res.status(400).json({
        "message": "Invalid LightScene ID!"
    });

    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Light data is required!"
    });

    const lightiningSceneService = new LightiningSceneService();
    const result = await lightiningSceneService.updateLightIntensity(req.user._id, req.params.lightSceneId, req.body.lightId, req.body.intensity);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.status(result.statusCode).json(result.lightScene);
});

router.put('/:lightSceneId/lightStatus', auth, async (req, res) => {
    const lightSceneIdError = validateObjectId(req.params.lightSceneId);
    if (lightSceneIdError.error) return res.status(400).json({
        "message": "Invalid LightScene ID!"
    });

    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Light data is required!"
    });

    const lightiningSceneService = new LightiningSceneService();
    const result = await lightiningSceneService.updateLightStatus(req.user._id, req.params.lightSceneId, req.body.lightId);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.status(result.statusCode).json(result.lightScene);
});

module.exports = router;