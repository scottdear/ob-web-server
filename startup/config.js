const config = require('config');

module.exports = function () {
    if (!config.get('jwtPrivateKey')) {
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined!.');
    }

    if (!config.get('SENDGRID_API_KEY')) {
        throw new Error('FATAL ERROR: SENDGRID_API_KEY is not defined!.')
    }
}