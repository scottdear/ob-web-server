const admin = require('../../../middlewares/admin');

describe('admin middleware', () => {    
    
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
      };

    const mockRequest = (user) => {
        return {
          user: user
        };
    };

    it('should return 401 if no token is provided', () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();
        admin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if user is not admin', () => {
        const req = mockRequest({role: 'X'});
        const res = mockResponse();
        const next = jest.fn();
        admin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('happy path', () => {
        const req = mockRequest({role: 'A'});
        const res = mockResponse();
        const next = jest.fn();
        admin(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});