const express = require('express');
const router = express.Router();

const Notifier = require('../services/notifier');

router.get('/', (req, res) => {
    res.redirect('https://ocean.builders/');
})

router.get('/test', async (req, res) => {
    const tokens = req.body.tokens
    const notificationContainer = req.body.notificationContainer

    const result = await Notifier.createAndSendNotification(tokens, notificationContainer);

    return res.status(200).json(result);
})

module.exports = router;