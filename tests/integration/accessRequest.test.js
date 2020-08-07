const request = require('supertest');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { RequestAccess } = require('../../models/accessRequest');
const { User } = require('../../models/users/user');
const { SeaPod } = require('../../models/seapod/seapod');
const { Permission } = require('../../models/permission/permission');
let server;

describe('/api/accessRequest', () => {
    beforeAll(async () => {
        jest.setTimeout(10000000);
    })

    beforeEach(() => { server = require('../../index'); })
    afterEach(async () => {
        server.close();
        await RequestAccess.deleteMany({});
        await User.deleteMany({});
        await SeaPod.deleteMany({});
        await Permission.deleteMany({});
    }); 

    describe('GET /:id', () => {
        let token, user, accessRequest;
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (id) => {
            return await request(server)
            .get('/v1/api/access-requests/' + id)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);
        }

        beforeEach(() => {
            user = {
                _id: mongoose.Types.ObjectId().toHexString(),
                jti: jti,
                tokensAndDevices: []
            }
            accessRequest = new RequestAccess({
                period: 86400000,
                user: {
                    _id: '5ed16ae8528b88135cdd40f4',
                    name: 'name name',
                    imageUrl: "",
                    email: "user@company.com",
                    mobileNumber: "+201111111111",
                },
                seaPod: {
                    name: 'name name',
                    vessleCode: 'SE1699B',
                },
                type: 'GUEST',
                checkIn: 1581191756216
            });
        })

        it('should return 400 if validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(1);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 404 if request not found', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Request Not found!');
        });

        it('should return 200 if success in access request by id', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(200);
        });
    });

    describe('POST /new', () => {
        let body;
        const exec = async (body) => {
            return await request(server)
            .post('/v1/api/access-requests/new')
            .set('notificationToken', 'x')
            .set('hardwareId', 'id')
            .set('model', 'y')
            .send(body);
        }

        beforeEach(() => {
            body = {
                user: {
                    firstName: "Ata",
                    lastName: "Mahmoud",
                    email: "ata.at22220@hotmail.com",
                    mobileNumber: "+201092101362",
                    password: "Ata@dsgsdf41414",
                    country: "Egypt"
                },
                request: {
                    type: "GUEST",
                    period: 86400000,
                    vessleCode: "SE1699B",
                    checkIn: 1581191756216
                }
            };
        })

        it('should return 500 if request headers is missing', async () => {
            const res = await request(server)
                .post('/v1/api/access-requests/new')
                .send(body);
            
            expect(res.status).toBe(500);
        })

        it('should return 400 if body is empty', async () => {
            body = '';
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'user and request data are required');
        })

        it('should return 400 if user validation failed', async () => {
            body = {
                user: { },
                request: {
                    type: "GUEST",
                    period: 86400000,
                    vessleCode: "SE1699B",
                    checkIn: 1581191756216
                }
            };
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 400 if request validation failed', async () => {
            body = {
                user: {
                    firstName: "Ata",
                    lastName: "Mahmoud",
                    email: "ata.at22220@hotmail.com",
                    mobileNumber: "+201092101362",
                    password: "Ata@dsgsdf41414",
                    country: "Egypt"
                },
                request: {}
            };
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 404 if seapod is not found', async () => {
            SeaPod.findOne = jest.fn().mockReturnValue(null);
            const res = await exec(body);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'SeaPod Not found!');
        })

        it('should return 200 if success in send access request of new user', async () => {
            const seapod = {
                _id: mongoose.Types.ObjectId().toHexString(),
                SeaPodName:'name name',
                vessleCode: body.request.vessleCode,
                accessRequests: [],
                users: [ {
                        isDisabled: false,
                        userName: "name name",
                        profilePicUrl: "",
                        type: "OWNER",
                        notificationToken: 'x'
                } ],
                save: jest.fn(() => '')
            }
            SeaPod.findOne = jest.fn().mockReturnValue(seapod);
            
            const res = await exec(body);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'PENDING');
        })
    });

    describe('PUT /:id', () => {
        let token, user, accessRequest;
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (accessRequestId) => {
            return await request(server)
            .put('/v1/api/access-requests/' + accessRequestId)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
        }

        beforeEach(() => {
            const userId = mongoose.Types.ObjectId().toHexString();
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: []
            }

            accessRequest = new RequestAccess({
                period: 86400000,
                user: {
                    _id: userId,
                    name: 'name name',
                    imageUrl: "",
                    email: "user@company.com",
                    mobileNumber: "+201111111111",
                },
                seaPod: {
                    name: 'name name',
                    vessleCode: 'SE1699B',
                },
                type: 'GUEST',
                checkIn: 1581191756216,
                status: 'PENDING'
            });
        })

        it('should return 401 if no token is provided', async () => {
            await accessRequest.save();
            const res = await request(server)
            .put('/v1/api/access-requests/' + accessRequest._id)  
            
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
        
        it('should return 400 if validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(1);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 404 if request not found', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Request not found!');
        })

        it('should return 401 if user are not allowed to cancel', async () => {
            token = new User(user).generateAuthToken(user.jti);
            accessRequest.user._id = mongoose.Types.ObjectId().toHexString();
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'You are not allowed to update this request status');
        })

        it('should return 200 if success in cancel access request', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const users = { users: [{
                isDisabled: false,
                userName: "name name",
                profilePicUrl: "",
                type: "OWNER",
                notificationToken: 'x'
            }] };
            SeaPod.findById = jest.fn().mockImplementationOnce(() => ({
                select: jest.fn().mockReturnValueOnce(users)
            }));

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'CANCELED');
        })
    });

    describe('PUT /:id/rejection', () => {
        let token, user, accessRequest;
        const userId = mongoose.Types.ObjectId().toHexString();
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (accessRequestId) => {
            return await request(server)
            .put('/v1/api/access-requests/' + accessRequestId + '/rejection')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
        }

        beforeEach(() => {
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: [ ]
            }

            accessRequest = new RequestAccess({
                period: 86400000,
                user: {
                    _id: userId,
                    name: 'name name',
                    imageUrl: "",
                    email: "user@company.com",
                    mobileNumber: "+201111111111",
                },
                seaPod: {
                    name: 'name name',
                    vessleCode: 'SE1699B',
                },
                type: 'GUEST',
                checkIn: 1581191756216,
                status: 'PENDING'
            });
        })

        it('should return 401 if no token is provided', async () => {
            await accessRequest.save();
            const res = await request(server)
            .put('/v1/api/access-requests/' + accessRequest._id + '/rejection')  
            
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
        
        it('should return 400 if validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(1);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 404 if request not found', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Request not found!');
        })

        it('should return 403 if user is not the owner', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const users = { users: [{
                _id: mongoose.Types.ObjectId().toHexString(),
                isDisabled: false,
                userName: "name name",
                profilePicUrl: "",
                type: "OWNER",
                notificationToken: 'x'
            }] };

            SeaPod.findById = jest.fn().mockImplementationOnce(() => ({
                select: jest.fn().mockReturnValueOnce(users)
            }));

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Your are not allowed to take this action on the current seapod');
        })

        it('should return 200 if success in reject access request', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything',
                notificationToken: 'x'
            });
            User.findById = jest.fn()
            .mockImplementationOnce(() => user)
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnValueOnce(user)
            }));

            const users = { users: [{
                _id: userId,
                isDisabled: false,
                userName: "name name",
                profilePicUrl: "",
                type: "OWNER",
                notificationToken: 'x'
            }] };
            SeaPod.findById = jest.fn().mockImplementationOnce(() => ({
                select: jest.fn().mockReturnValueOnce(users)
            }));

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'REJECTED');
        })
    });

    describe('PUT /:id/approval', () => {
        let token, user, body, accessRequest;
        const userId = mongoose.Types.ObjectId().toHexString();
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (accessRequestId) => {
            return await request(server)
            .put('/v1/api/access-requests/' + accessRequestId + '/approval')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body)
        }

        beforeEach(() => {
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: [],
                getUserName: jest.fn().mockReturnValue('name name')
            }

            accessRequest = new RequestAccess({
                period: 86400000,
                user: {
                    _id: userId,
                    name: 'name name',
                    imageUrl: "",
                    email: "user@company.com",
                    mobileNumber: "+201111111111",
                },
                seaPod: {
                    name: 'name name',
                    vessleCode: 'SE1699B',
                },
                type: 'MEMBER',
                checkIn: 1581191756216,
                status: 'PENDING'
            });

            body = {
                type:'MEMBER',
                period: 86400000
            }
        })

        it('should return 401 if no token is provided', async () => {
            await accessRequest.save();
            const res = await request(server)
            .put('/v1/api/access-requests/' + accessRequest._id + '/approval')  
            
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
        
        it('should return 400 if validation of id failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(1);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 400 if validation of request failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            body.type = 'OWNER';
            const res = await exec(accessRequest._id);
            
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 404 if request not found', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Request not found!');
        })

        it('should return 403 if user is not the owner', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const users = { users: [{
                _id: mongoose.Types.ObjectId().toHexString(),
                isDisabled: false,
                userName: "name name",
                profilePicUrl: "",
                type: "OWNER",
                notificationToken: 'x'
            }] };

            SeaPod.findById = jest.fn().mockImplementationOnce(() => ({
                select: jest.fn().mockReturnValueOnce(users)
            }));

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Your are not allowed to take this action on the current seapod');
        })

        it('should return 200 if success in accept access request', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything',
                notificationToken: 'x'
            });
            User.findById = jest.fn().mockImplementationOnce(() => user);
            
            user.seaPods = mongoose.Types.ObjectId().toHexString();
            User.findOneAndUpdate = jest.fn().mockImplementationOnce(() => user);

            const users = { 
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                push: jest.fn().mockReturnValue()
            };            
            const seapod = {
                SeaPodName: "name name",
                vessleCode: "SE1699B",
                accessRequests: [],
                users: users,
                permissionSets: [ {
                    _id: mongoose.Types.ObjectId().toHexString(),
                    Name: "Default MEMBER Permissions",
                }],
                save: jest.fn().mockReturnValue(),
            };
            SeaPod.findById = jest.fn()
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnValueOnce(users),
            }))
            .mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));
            
            const res = await exec(accessRequest._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'ACCEPTED');
        })
    });

    describe('POST /invitations/:id', () => {
        let token, user, body, seapod;
        const userId = mongoose.Types.ObjectId().toHexString();
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (seapodId) => {
            return await request(server)
            .post('/v1/api/access-requests/invitations/' + seapodId)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body)
        }

        beforeEach(() => {
            user = {
                _id: userId,
                email: 'user@company.com',
                mobileNumber: "+201111111111",
                jti: jti,
                tokensAndDevices: [],
                accessInvitation: [],
                notifications: [],
                save: jest.fn().mockReturnValue(),
            };

            seapod = {
                _id: seapodId,
                SeaPodName: "name name",
                vessleCode: "SE1699B",
                accessInvitation: [],
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                save: jest.fn().mockReturnValue(),
            };

            body = {
                email: "user@company.com"
            }
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(server)
            .post('/v1/api/access-requests/invitations/' + seapodId)
            
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
       
        it('should return 400 if validation of seapod id failed', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(1);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 400 if validation of email failed', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            body.email = 'wrong mail';
            const res = await exec(seapod._id);
            
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 400 if request already exists', async () => {
            token = new User(user).generateAuthToken(user.jti);

            const accessRequest = new RequestAccess({
                period: 86400000,
                user: {
                    _id: userId,
                    name: 'name name',
                    imageUrl: "",
                    email: "user@company.com",
                    mobileNumber: "+201111111111",
                },
                seaPod: {
                    _id: seapodId,
                    name: 'name name',
                    vessleCode: 'SE1699B',
                },
                type: 'GUEST',
                checkIn: 1581191756216,
                status: 'PENDING'
            });
            await accessRequest.save();
        

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(seapod._id);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'This user have an already invitation to access your Sea Pod');
        })

        it('should return 404 if user not found', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn()
                .mockReturnValue(null)
                .mockReturnValueOnce(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockReturnValue(seapod);

            const res = await exec(seapod._id);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User Not Found!');
        })

        it('should return 401 if user is not the owner', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.users[0]._id = mongoose.Types.ObjectId().toHexString();
            SeaPod.findById = jest.fn().mockReturnValueOnce(seapod);

            const res = await exec(seapod._id);

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. You are not allowed to do this operation');
        })

        it('should return 404 if seapod not found', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockReturnValue(null);

            const res = await exec(seapod._id);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'SeaPod Not Found!');
        })

        it('should return 200 if success in add member', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything',
                notificationToken: 'x'
            });
            User.findById = jest.fn().mockReturnValue(user);
            User.findOne = jest.fn().mockReturnValue(user);

            SeaPod.findById = jest.fn().mockReturnValueOnce(seapod);

            const res = await exec(seapod._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'PENDING');
        })
    });

    describe('PUT /invitations/:id/approval', () => {
        let token, user, seapod, accessRequest;
        const userId = mongoose.Types.ObjectId().toHexString();
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (invitationId) => {
            return await request(server)
            .put('/v1/api/access-requests/invitations/' + invitationId + '/approval')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
        }

        beforeEach(() => {
            user = {
                _id: userId,
                email: 'user@company.com',
                mobileNumber: "+201111111111",
                jti: jti,
                tokensAndDevices: [],
                accessInvitation: [],
                notifications: [],
                save: jest.fn().mockReturnValue(),
                getUserName: jest.fn().mockReturnValue('name name'),
            };

            seapod = {
                _id: seapodId,
                SeaPodName: "name name",
                vessleCode: "SE1699B",
                accessInvitation: [],
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                permissionSets: [ {
                    _id: mongoose.Types.ObjectId().toHexString(),
                    Name: "Default MEMBER Permissions",
                }],
                save: jest.fn().mockReturnValue(),
            };

            accessRequest = new RequestAccess({
                period: 86400000,
                user: {
                    _id: userId,
                    name: 'name name',
                    imageUrl: "",
                    email: "user@company.com",
                    mobileNumber: "+201111111111",
                },
                seaPod: {
                    name: 'name name',
                    vessleCode: 'SE1699B',
                },
                type: 'MEMBER',
                checkIn: 1581191756216,
                status: 'PENDING'
            });
        })

        it('should return 401 if no token is provided', async () => {
            await accessRequest.save();
            const res = await request(server)
            .put('/v1/api/access-requests/invitations/' + accessRequest._id + '/approval')
            
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
       
        it('should return 400 if validation of invitation id failed', async () => {
            await accessRequest.save();
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(1);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 404 if invitation not found', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Invitation not found!');
        })

        it('should return 401 if user is not the owner', async () => {
            accessRequest.user._id = mongoose.Types.ObjectId().toHexString();
            await accessRequest.save();
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockReturnValueOnce(seapod);

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. You are not allowed to accept this invitation');
        })

        it('should return 200 if success in accept invitation', async () => {
            await accessRequest.save();

            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything',
                notificationToken: 'x'
            });
            User.findById = jest.fn().mockReturnValue(user);
            User.findOneAndUpdate = jest.fn().mockReturnValue(user);

            SeaPod.findById = jest.fn()
            .mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'ACCEPTED');
        })
    });

    describe('PUT /invitations/:id/rejection', () => {
        let token, user, seapod, accessRequest;
        const userId = mongoose.Types.ObjectId().toHexString();
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (invitationId) => {
            return await request(server)
            .put('/v1/api/access-requests/invitations/' + invitationId + '/rejection')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
        }

        beforeEach(() => {
            user = {
                _id: userId,
                email: 'user@company.com',
                mobileNumber: "+201111111111",
                jti: jti,
                tokensAndDevices: [],
                accessInvitation: [],
                notifications: [],
                save: jest.fn().mockReturnValue(),
                getUserName: jest.fn().mockReturnValue('name name'),
            };

            seapod = {
                _id: seapodId,
                SeaPodName: "name name",
                vessleCode: "SE1699B",
                accessInvitation: [],
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                save: jest.fn().mockReturnValue(),
            };

            accessRequest = new RequestAccess({
                period: 86400000,
                user: {
                    _id: userId,
                    name: 'name name',
                    imageUrl: "",
                    email: "user@company.com",
                    mobileNumber: "+201111111111",
                },
                seaPod: {
                    name: 'name name',
                    vessleCode: 'SE1699B',
                },
                type: 'MEMBER',
                checkIn: 1581191756216,
                status: 'PENDING'
            });
        })

        it('should return 401 if no token is provided', async () => {
            await accessRequest.save();
            const res = await request(server)
            .put('/v1/api/access-requests/invitations/' + accessRequest._id + '/rejection')
            
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
       
        it('should return 400 if validation of invitation id failed', async () => {
            await accessRequest.save();
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(1);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 404 if invitation not found', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Invitation not found!');
        })

        it('should return 401 if user is not the owner', async () => {
            accessRequest.user._id = mongoose.Types.ObjectId().toHexString();
            await accessRequest.save();
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockReturnValueOnce(seapod);

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. You are not allowed to reject this invitation');
        })

        it('should return 200 if success in reject invitation', async () => {
            await accessRequest.save();

            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything',
                notificationToken: 'x'
            });
            User.findById = jest.fn().mockReturnValue(user);
            User.findOneAndUpdate = jest.fn().mockReturnValue(user);

            SeaPod.findById = jest.fn().mockReturnValueOnce(seapod);

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'REJECTED');
        })
    });

    describe('PUT /invitations/:id', () => {
        let token, user, seapod, accessRequest;
        const userId = mongoose.Types.ObjectId().toHexString();
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (invitationId) => {
            return await request(server)
            .put('/v1/api/access-requests/invitations/' + invitationId)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
        }

        beforeEach(() => {
            user = {
                _id: userId,
                email: 'user@company.com',
                mobileNumber: "+201111111111",
                jti: jti,
                tokensAndDevices: [],
                accessInvitation: [],
                notifications: [],
                save: jest.fn().mockReturnValue(),
                getUserName: jest.fn().mockReturnValue('name name'),
            };

            seapod = {
                _id: seapodId,
                SeaPodName: "name name",
                vessleCode: "SE1699B",
                accessInvitation: [],
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                save: jest.fn().mockReturnValue(),
            };

            accessRequest = new RequestAccess({
                period: 86400000,
                user: {
                    _id: userId,
                    name: 'name name',
                    imageUrl: "",
                    email: "user@company.com",
                    mobileNumber: "+201111111111",
                },
                seaPod: {
                    name: 'name name',
                    vessleCode: 'SE1699B',
                },
                type: 'MEMBER',
                checkIn: 1581191756216,
                status: 'PENDING'
            });
        })

        it('should return 401 if no token is provided', async () => {
            await accessRequest.save();
            const res = await request(server)
            .put('/v1/api/access-requests/invitations/' + accessRequest._id)
            
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
       
        it('should return 400 if validation of invitation id failed', async () => {
            await accessRequest.save();
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(1);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 404 if invitation not found', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Invitation not found!');
        })

        it('should return 401 if user is not the owner', async () => {
            await accessRequest.save();
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.users[0]._id = mongoose.Types.ObjectId().toHexString();
            SeaPod.findById = jest.fn().mockImplementationOnce(() => ({
                select: jest.fn().mockReturnValueOnce(seapod)
            }));
            const res = await exec(accessRequest._id);

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access Denied. You are not allowed to cancel this invitation');
        })

        it('should return 200 if success in cancel invitation', async () => {
            await accessRequest.save();

            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything',
                notificationToken: 'x'
            });
            User.findById = jest.fn()
            .mockImplementationOnce(() => user)
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnValueOnce(user)
            }));

            SeaPod.findById = jest.fn().mockImplementationOnce(() => ({
                select: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(accessRequest._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'CANCELED');
        })
    });

    describe('POST /existing', () => {
        let token, user, body, seapod, accessRequest;
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (body) => {
            return await request(server)
            .post('/v1/api/access-requests/existing')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);
        }

        beforeEach(() => {
            const userId = mongoose.Types.ObjectId().toHexString();
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: []
            }
            
            seapod = {
                _id: mongoose.Types.ObjectId().toHexString(),
                SeaPodName: "name name",
                vessleCode: "SE1699B",
                accessRequests: [],
                users: [ {
                        isDisabled: false,
                        userName: "name name",
                        profilePicUrl: "",
                        type: "OWNER",
                        notificationToken: 'x'
                } ],
                save: jest.fn(() => '')
            }

            body = {
                type: "GUEST",
                period: 86400000,
                vessleCode: "SE1699B",
                checkIn: 1581191756216
            };

            accessRequest = new RequestAccess({
                period: 86400000,
                user: {
                    _id: userId,
                    name: 'name name',
                    imageUrl: "",
                    email: "user@company.com",
                    mobileNumber: "+201111111111",
                },
                seaPod: {
                    name: 'name name',
                    vessleCode: 'SE1699B',
                },
                type: 'GUEST',
                checkIn: 1581191756216,
                status: 'PENDING'
            });
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(server)
                .post('/v1/api/access-requests/existing')
                .send(body);
            
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })

        it('should return 403 if forbidden', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'xxxx'
            });

            const res = await exec(body);

            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Forbidden. Access denied!');
        })

        it('should return 400 if invalid token', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await request(server)
            .post('/v1/api/access-requests/existing')
            .set('x-auth-token', 'x')
            .set('hardwareId', hardwareId)
            .send(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Token');
        })

        it('should return 400 if body is empty', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            body = '';
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'request is required');
        })

        it('should return 400 if validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            body = {
                period: 86400000,
                vessleCode: "SE1699B",
                checkIn: 1581191756216
            }
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 404 if user not found', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn()
                .mockReturnValue(null)
                .mockReturnValueOnce(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockReturnValue(seapod);

            const res = await exec(body);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User Not found!');
        })

        it('should return 404 if seapod not found', async () => {
            token = new User(user).generateAuthToken(user.jti);

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findOne = jest.fn().mockReturnValue(null);

            const res = await exec(body);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'SeaPod Not found!');
        })

        it('should return 200 if success in send access request of existing user (reqBody == accessRequest)', async () => {
            //areEqual(reqBody, accessRequest)
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();
               
            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            
            SeaPod.findById = jest.fn().mockReturnValue(seapod);
            
            const res = await exec(body);
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'PENDING');
        })

        it('should return 200 if success in send access request of existing user (reqBody != accessRequest) ', async () => {
            //areNotEqual(reqBody, accessRequest)
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findOne = jest.fn().mockReturnValue(seapod);

            body = {
                type: "OWNER",
                period: 86400000,
                vessleCode: "SE1699B",
                checkIn: 1581191756216
            };
            const res = await exec(body);
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'PENDING');
        });

        it('should return 403 if request is currently processing', async () => {
            token = new User(user).generateAuthToken(user.jti);
            await accessRequest.save();

            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            
            SeaPod.findOne = jest.fn().mockReturnValue(seapod);

            accessRequest.status = 'CANCELED';
            RequestAccess.findOne = jest.fn().mockReturnValue(accessRequest);

            body = {
                type: "OWNER",
                period: 86400000,
                vessleCode: "SE1699B",
                checkIn: 1581191756216
            };
            const res = await exec(body); 
            
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'You are not allowed to update this request at the current time');
        });
        
        it('should return 500 if error been thrown', async () => {
            token = new User(user).generateAuthToken(user.jti);
        
            User.findById = jest.fn().mockReturnValue(user);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
        
            RequestAccess.findOne = jest.fn().mockImplementation(() => {
                throw new Error ('AN ERROR');
            });
        
            const res = await exec(body);
        
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message');
        })

    });
})