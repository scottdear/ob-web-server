const accessControlAllowOrigin = require('../../../middlewares/accessControlAllowOrigin');

describe('accessControlAllowOrigin middleware', () => {    
    
    const mockResponse = () => {
        const res = {};
        res.header = jest.fn().mockReturnValue(res);
        return res;
    };

    it('happy path', () => {
        const req = {};
        const res = mockResponse();
        const next = jest.fn();
        accessControlAllowOrigin(req, res, next);
        expect(next.mock.calls.length).toBe(1);
    });
});