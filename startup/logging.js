const winston = require('winston');
require('winston-mongodb');

module.exports = function () {
    process.on('unhandledRejection', (ex) => {
        throw (ex);
    });


    winston.add(
        new winston.transports.File({
            filename: 'logs/logs.log'
        })
    );

    winston.exceptions.handle(
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'logs/unhandledExceptions.log'
        }),
        new winston.transports.MongoDB({
            db: process.env.MONGODB_URI,
            options: { useUnifiedTopology: true },
            collection: 'logs'
        })
    );
}