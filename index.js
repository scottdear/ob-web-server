const express = require('express');
const app = express();
const winston = require('winston');
require('dotenv').config();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/config')();
require('./startup/db')();
require('./startup/prod')(app);
require('./startup/jobs')();


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    winston.info(`Listening at ${port}`);
});

module.exports = server;