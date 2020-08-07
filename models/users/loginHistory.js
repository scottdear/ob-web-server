const loginAduitTrialSchema = require('./loginAduitTrial');
const extendSchema = require('../../helpers/extendSchema')

module.exports = extendSchema(loginAduitTrialSchema, {
    loginResult: {
        type: String,
        enum: ['SUCCEEDED', 'FAILD']
    }
});