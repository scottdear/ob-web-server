const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

module.exports = function () {
    // const dbUrl = 'mongodb://localhost/oceanbuilders';

    if (process.env.NODE_ENV == "development") {
        console.log('Starting at Dev Mode');
        mongoose.connect(config.get('db'), {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            replicaSet: 'rs'
        }).then(() => winston.info('Connecting to MongoDB(Dev Mode)...'));
    } else {
        mongoose.connect(config.get('db'), {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
        }).then(() => winston.info('Connecting to MongoDB(Production Mode)...'));
    }

}