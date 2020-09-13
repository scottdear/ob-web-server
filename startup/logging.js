const winston = require('winston');
// require('winston-mongodb');
module.exports = function () {
    process.on('unhandledRejection', (ex) => {
        throw (ex);
    });

    winston.exceptions.handle(new winston.transports.Console(),
        new winston.transports.File({
            filename: 'unhandledExceptions.log'
        }));

    winston.add(new winston.transports.File({ filename: 'logs.log' }));

    // winston.add(new winston.transports.MongoDB({
    //     db: 'mongodb://localhost/oceanbuilders',
    // }));
}