const db = require('../../../startup/db');
const mongoose = require('mongoose');

describe('db startup', () => {
    mongoose.connect = jest.fn().mockResolvedValue();

    it('should connect to local db when NODE_ENV == "development"', () => {
        process.env.NODE_ENV = "development";
        db();
        expect(mongoose.connect).toHaveBeenCalled();
    })

    it('should connect to server db otherwise"', () => {
        process.env.NODE_ENV = jest.fn().mockReturnValue('otherwise');
        db();
        expect(mongoose.connect).toHaveBeenCalled();
    })
})