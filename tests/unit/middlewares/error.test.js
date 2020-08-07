const error = require('../../../middlewares/error');

describe('error middleware', () => {        
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        return res;
    };

    it('should return 500 - winston error ', () => {
        const err = {message: 'error message', level: 'error'};
        const req = {};
        const res = mockResponse();
        const next = jest.fn();
        error(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(err.message);
    });
});