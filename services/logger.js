const { Log } = require('../models/log');

class LoggerService {
    
    async getAllLog(){

        const log = await Log.find();

        return {
            isError: false,
            log
        }
    }

}

exports.LoggerService = LoggerService;