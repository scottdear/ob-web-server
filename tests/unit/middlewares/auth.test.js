const { User } = require('../../../models/users/user');
const auth = require('../../../middlewares/auth');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

describe('auth middleware', () => {    
    let user;
    const jti = uuidv4();
    let token;
    const hardwareId = 'anything';
    const next = jest.fn();

    beforeEach(()=> {
        user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            jti: jti,
            tokensAndDevices: []
        }
    });
    
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    const mockRequest = (token, hardwareId, user) => {
        const req = {
            header: jest.fn(() => 'default')
                .mockImplementationOnce(() => token)
                .mockImplementationOnce(() => hardwareId),
            user: user
        };
        return req;
    };

    it('should return 401 if no token provided', async () => {
        token = '';
        user = '';
        const req = mockRequest(token, hardwareId, user);
        const res = mockResponse();
        await auth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({"message": "Access denied. No token provided"});
    });

    it('should return 403 if access is denied (token invalidated)', async () => {
        token = new User(user).generateAuthToken(user.jti);
        User.findById = jest.fn().mockReturnValue(user);
        user.tokensAndDevices.push({
            jti: 12345,
            hardwareId: 'anything'
        });
        const req = mockRequest(token, hardwareId, user);
        const res = mockResponse();
        await auth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({'message': "Forbidden. Access denied!"});
    });

    it('should return 403 if tokenAndDevices is empty)', async () => {
        token = new User(user).generateAuthToken(user.jti);
        User.findById = jest.fn().mockReturnValue(user);
        const req = mockRequest(token, hardwareId, user);
        const res = mockResponse();
        await auth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({'message': "Forbidden. Access denied!"});
    });

    it('should return 400 if token is invalid', async () => {
        const jti = uuidv4();
        const user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            jti: jti,
            tokensAndDevices: []
        }
        token = 'not match token';
        User.findById = jest.fn().mockReturnValue(user);
        user.tokensAndDevices.push({
            jti: jti,
            hardwareId: 'anything'
        });
        const req = mockRequest(token, hardwareId, user);
        const res = mockResponse();
        await auth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({'message': "Invalid Token"});
    });

    //happy path
    it('should populate req.user with the payload of a valid JWT', async () => {
        const jti = uuidv4();
        const user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            jti: jti,
            tokensAndDevices: []
        }
        user.tokensAndDevices.push({
            jti: jti,
            hardwareId: 'anything'
        });

        token = new User(user).generateAuthToken(jti);        
        User.findById = jest.fn().mockReturnValue(user);
        
        const req = mockRequest(token, hardwareId, user);
        const res = mockResponse();
        const next = jest.fn();
        await auth(req, res, next);
        expect(req.user).toMatchObject({_id: user._id});
    });
});