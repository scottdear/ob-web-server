const express = require('express');
const path = require('path');

const { LoggerService } = require('../services/logger');

const router = express.Router();
// const auth = require('../middlewares/auth');
// const admin = require('../middlewares/admin');

router.get('/' , async (req, res) => {
    const loggerService = new LoggerService();
    const result = await loggerService.getAllLog();

    if (result.isError) return res.status(result.statusCode).send({
        "message": result.error
    });
    return res.send(result.log);
});

//view webpage
router.get('/view', async (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, '/../public/log.html'));
});

module.exports = router;