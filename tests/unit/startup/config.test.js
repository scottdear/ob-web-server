const test = require('../../../startup/config');
const config = require('config');

describe('config startup', () => {

    it('should throw error if jwtPrivateKey is not defined', () => {
        config.get = jest.fn().mockReturnValueOnce();
        expect(() => { test() }).toThrow();
    })

    it('should throw error if SENDGRID_API_KEY is not defined', () => {
        config.get = jest.fn()
            .mockReturnValueOnce(true)
            .mockReturnValueOnce();
        expect(() => { test() }).toThrow();
    })
});