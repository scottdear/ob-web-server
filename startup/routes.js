const express = require('express');
const cors = require('cors');
const error = require('../middlewares/error');
const users = require('../routes/users');
const auth = require('../routes/auth');
const main = require('../routes/main');
const seapods = require('../routes/seapods');
const lightiningScenes = require('../routes/lightiningScenes');
const admins = require('../routes/admins');
const accessRequests = require('../routes/accessRequests');
const permissions = require('../routes/permissions');
const swagger = require('../routes/swagger');
const logger = require('../routes/logger');
const API_VERSION = 'v1';

module.exports = function (app) {
    app.use(cors({
        optionsSuccessStatus: 200
    }));
    app.use(express.json());
    app.use(express.urlencoded({extended:false}));
    app.use(express.static('assets'));

    app.use('/', main);
    app.use(`/${API_VERSION}/api/users`, users);
    app.use(`/${API_VERSION}/api/auth`, auth);
    app.use(`/${API_VERSION}/api/seapods`, seapods);
    app.use(`/${API_VERSION}/api/lightining-scenes`, lightiningScenes);
    app.use(`/${API_VERSION}/api/admins`, admins);
    app.use(`/${API_VERSION}/api/access-requests`, accessRequests);
    app.use(`/${API_VERSION}/api/permissions`, permissions);
    app.use(`/${API_VERSION}/docs`, swagger);
    app.use(`/${API_VERSION}/logs`, logger);
    app.use(error);
}