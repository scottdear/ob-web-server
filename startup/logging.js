const winston = require('winston');
require('winston-mongodb');

module.exports = function () {
    process.on('unhandledRejection', (ex) => {
        throw (ex);
    });

    winston.exceptions.handle(new winston.transports.Console(),
        new winston.transports.File({
            filename: 'unhandledExceptions.log'
        }));

    winston.exceptions.handle(new winston.transports.MongoDB({
        db: process.env.MONGODB_URI,
        options: { useUnifiedTopology: true },
        collection: 'server_logs'
    }));

    winston.add(new winston.transports.File({ filename: 'logs.log' }));

    winston.add(new winston.transports.MongoDB({
        db: process.env.MONGODB_URI,
        options: { useUnifiedTopology: true },
        collection: 'server_logs'
    }));
}