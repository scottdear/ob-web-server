const request = require('supertest');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const { User } = require('../../models/users/user');
const { SeaPod } = require('../../models/seapod/seapod');
const { Permission } = require('../../models/permission/permission');
let server;

describe('/api/users', () => {
    beforeAll(async () => {
        jest.setTimeout(10000000);
    })

    beforeEach(() => { server = require('../../index'); })

    afterEach(async () => {
        server.close();
        await SeaPod.deleteMany({});
        await User.deleteMany({});
        await Permission.deleteMany({});
    })

    describe('PUT /', () => {
        let user, token, body;
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (body) => {
            return await request(server)
            .put('/v1/api/users/')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);
        }

        beforeEach(() => {
            user = new User({
                _id: mongoose.Types.ObjectId().toHexString(),
                previousPasswords:[],
                profileImageUrl:"",
                seaPods:[{
                    _id: mongoose.Types.ObjectId().toHexString(),
                }],
                isVerified:true,
                accessRequests:[],
                accessInvitation:[],
                firstName:"Name",
                lastName:"Name",
                email:"mail@company.com",
                mobileNumber:"+201111111111",
                password:"passworD@123",
                country:"Egypt",
                loginAuditTrials:[],
                notifications:[],
                actionHistorys:[],
                loginHistory:[],
                emergencyContacts:[],
                tokensAndDevices:[{
                    jti: jti,
                    hardwareId: 'anything',
                    notificationToken: 'token',
                    model: 'model'
                }],
            });

            body = {
                firstName: "NAME",
                lastName: "NAME",
                email: "mail@company.com",
                mobileNumber: "+201111111111",
                country: "Egypt"
            }
        })

        it('should return 400 if body is empty', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            body = '';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'User data required!');
        })

        it('should return 401 if no token is provided', async () => {
            token = '';

            const res = await request(server)
            .put('/v1/api/users/')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);
            
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
        
        it('should return 403 if forbidden', async () => {
            await user.save();
            token = new User(user).generateAuthToken(null);

            const res = await exec(body);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Forbidden. Access denied!');
        })

        it('should return 400 if invalid token', async () => {
            await user.save();
            token = new User(user).generateAuthToken(null);

            const res = await request(server)
            .put('/v1/api/users/')
            .set('x-auth-token', 'x')
            .set('hardwareId', hardwareId);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Token');
        })

        it('should return 200 if success in update profile', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('firstName', 'NAME');
        })
        
        it('should return 500 if user not found', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            User.updateOne = jest.fn().mockReturnValueOnce('');

            const res = await exec(body);
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to update user data please try again later!');
        })
    })

    describe('PUT /reset', () => {
        let user, token, body;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const model = 'model';
        const notificationToken = 'token';

        const exec = async (body) => {
            return await request(server)
            .put('/v1/api/users/reset')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .set('model', model)
            .set('notificationToken', notificationToken)
            .send(body);
        }

        beforeEach(() => {
            user = new User({
                _id: mongoose.Types.ObjectId().toHexString(),
                previousPasswords:["passworD@123"],
                profileImageUrl:"",
                seaPods:[{
                    _id: mongoose.Types.ObjectId().toHexString(),
                }],
                isVerified:true,
                accessRequests:[],
                accessInvitation:[],
                firstName:"Name",
                lastName:"Name",
                email:"mail@company.com",
                mobileNumber:"+201111111111",
                password:"passworD@123",
                country:"Egypt",
                loginAuditTrials:[],
                notifications:[],
                actionHistorys:[],
                loginHistory:[],
                emergencyContacts:[],
                tokensAndDevices:[{
                    jti: jti,
                    hardwareId: 'anything',
                    notificationToken: 'token',
                    model: 'model'
                }],
            });

            body = {
                currentPassword:"passworD@123",
                newPassword:"passworD@123D"
            }
        })

        it('should return 400 if body is empty', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            body = '';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Current and new password are required!');
        })

        it('should return 401 if no token is provided', async () => {
            token = '';

            const res = await exec(body);         
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
        
        it('should return 403 if forbidden', async () => {
            await user.save();
            token = new User(user).generateAuthToken(null);

            const res = await exec(body);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Forbidden. Access denied!');
        })

        it('should return 400 if invalid token', async () => {
            await user.save();
            token = new User(user).generateAuthToken(null);

            const res = await request(server)
            .put('/v1/api/users/reset')
            .set('x-auth-token', 'x')
            .set('hardwareId', hardwareId)
            .send(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Token');
        })

        it('should return 400 if password validation failed', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            body.newPassword = "password";

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 200 if success in update password', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            bcrypt.compare = jest.fn().mockReturnValueOnce(true);
            
            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Password updated successfully!');
            expect(res.header).toHaveProperty('x-auth-token')
        })
        
        it('should return 400 if current password is wrong', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            bcrypt.compare = jest.fn().mockReturnValueOnce(false);
        
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid password');
        })

        it('should return 400 if new password is equal to old one', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            bcrypt.compare = jest.fn().mockReturnValue(true);

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', "You Shouldn't use previously used passwords!");
        })

        it('should return 404 if user not found', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            User.findById = jest.fn()
                .mockReturnValueOnce(user)
                .mockReturnValueOnce(null);

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User not found!');
        })
    })

    describe('GET /notifications', () => {
        let user, token;
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async () => {
            return await request(server)
            .get('/v1/api/users/notifications')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);
        }

        beforeEach(() => {
            user = new User({
                _id: mongoose.Types.ObjectId().toHexString(),
                previousPasswords:[],
                profileImageUrl:"",
                seaPods:[{
                    _id: mongoose.Types.ObjectId().toHexString(),
                }],
                isVerified:true,
                accessRequests:[],
                accessInvitation:[],
                firstName:"Name",
                lastName:"Name",
                email:"mail@company.com",
                mobileNumber:"+201111111111",
                password:"passworD@123",
                country:"Egypt",
                loginAuditTrials:[],
                notifications:[
                    {
                        seen: false,
                        priority: 1,
                        title: "title",
                        message: "message",
                        _id: mongoose.Types.ObjectId().toHexString()
                    },                
                ],
                actionHistorys:[],
                loginHistory:[],
                emergencyContacts:[],
                tokensAndDevices:[{
                    jti: jti,
                    hardwareId: 'anything',
                    notificationToken: 'token',
                    model: 'model'
                }],
            });
        })

        it('should return 200 if success in getting notifications', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            User.findById = jest.fn()
            .mockReturnValue(user)
            .mockImplementationOnce(() => user)
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnValueOnce(user)
            }));
            
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body[0]).toHaveProperty('seen', false);
        })

        it('should return 401 if no token is provided', async () => {
            token = '';

            const res = await exec();         
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
        
        it('should return 403 if forbidden', async () => {
            await user.save();
            token = new User(user).generateAuthToken(null);

            const res = await exec();
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Forbidden. Access denied!');
        })

        it('should return 400 if invalid token', async () => {
            await user.save();
            token = new User(user).generateAuthToken(null);

            const res = await request(server)
            .get('/v1/api/users/notifications')
            .set('x-auth-token', 'x')
            .set('hardwareId', hardwareId);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Token');
        })

        it('should return 404 if user not found', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            User.findById = jest.fn()
                .mockReturnValueOnce(user)
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnValueOnce()
                }));

            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User Not Found!');
        })
    })   

    describe('PUT /notifications', () => {
        let user, token, body;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const notificationId = mongoose.Types.ObjectId().toHexString();

        const exec = async (body) => {
            return await request(server)
            .put('/v1/api/users/notifications')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);
        }

        beforeEach(() => {
            user = new User({
                _id: mongoose.Types.ObjectId().toHexString(),
                previousPasswords:[],
                profileImageUrl:"",
                seaPods:[{
                    _id: mongoose.Types.ObjectId().toHexString(),
                }],
                isVerified:true,
                accessRequests:[],
                accessInvitation:[],
                firstName:"Name",
                lastName:"Name",
                email:"mail@company.com",
                mobileNumber:"+201111111111",
                password:"passworD@123",
                country:"Egypt",
                loginAuditTrials:[],
                notifications:[
                    {
                        seen: false,
                        priority: 1,
                        title: "title",
                        message: "message",
                        _id: notificationId
                    },                
                ],
                actionHistorys:[],
                loginHistory:[],
                emergencyContacts:[],
                tokensAndDevices:[{
                    jti: jti,
                    hardwareId: 'anything',
                    notificationToken: 'token',
                    model: 'model'
                }],
            });

            body = {
                notificationIds: [ notificationId ]
            }
        })

        it('should return 200 if success in update notifications', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            User.findById = jest.fn().mockReturnValue(user);

            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body[0]).toHaveProperty('seen', true);
        })

        it('should return 401 if no token is provided', async () => {
            token = '';

            const res = await exec(body);         
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
        
        it('should return 403 if forbidden', async () => {
            await user.save();
            token = new User(user).generateAuthToken(null);

            const res = await exec(body);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Forbidden. Access denied!');
        })

        it('should return 400 if invalid token', async () => {
            await user.save();
            token = new User(user).generateAuthToken(null);

            const res = await request(server)
            .put('/v1/api/users/notifications')
            .set('x-auth-token', 'x')
            .set('hardwareId', hardwareId)
            .send(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Token');
        })

        it('should return 400 if notification validation failed', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            body.notificationIds = [ 'invalid' ];
            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body[0]).toHaveProperty('seen', true);
        })

        it('should return 404 if user not found', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            User.findById = jest.fn().mockReturnValueOnce(user);

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User Not Found');
        })
    })

    describe('PUT /notifications/:notificationId', () => {
        let user, token;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const notificationId = mongoose.Types.ObjectId().toHexString();

        const exec = async (notificationId) => {
            return await request(server)
            .put('/v1/api/users/notifications/'+ notificationId)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);
        }

        beforeEach(() => {
            user = new User({
                _id: mongoose.Types.ObjectId().toHexString(),
                previousPasswords:[],
                profileImageUrl:"",
                seaPods:[{
                    _id: mongoose.Types.ObjectId().toHexString(),
                }],
                isVerified:true,
                accessRequests:[],
                accessInvitation:[],
                firstName:"Name",
                lastName:"Name",
                email:"mail@company.com",
                mobileNumber:"+201111111111",
                password:"passworD@123",
                country:"Egypt",
                loginAuditTrials:[],
                notifications:[
                    {
                        seen: false,
                        priority: 1,
                        title: "title",
                        message: "message",
                        _id: notificationId
                    },                
                ],
                actionHistorys:[],
                loginHistory:[],
                emergencyContacts:[],
                tokensAndDevices:[{
                    jti: jti,
                    hardwareId: 'anything',
                    notificationToken: 'token',
                    model: 'model'
                }],
            });
        })

        it('should return 200 if success in toggle seen state', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            User.findById = jest.fn().mockReturnValue(user);
            
            const res = await exec(notificationId);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('seen', true);
        })

        it('should return 401 if no token is provided', async () => {
            token = '';

            const res = await exec(notificationId);
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
        
        it('should return 403 if forbidden', async () => {
            await user.save();
            token = new User(user).generateAuthToken(null);

            const res = await exec(notificationId);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Forbidden. Access denied!');
        })

        it('should return 400 if invalid token', async () => {
            await user.save();
            token = new User(user).generateAuthToken(null);

            const res = await request(server)
            .put('/v1/api/users/notifications/'+notificationId)
            .set('x-auth-token', 'x')
            .set('hardwareId', hardwareId);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Token');
        })

        it('should return 404 if notification not found', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            const res = await request(server)
            .put('/v1/api/users/notifications/'+mongoose.Types.ObjectId().toHexString())
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Notification Not Found');
        })

        it('should return 400 if notification validation failed', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            const res = await request(server)
            .put('/v1/api/users/notifications/1')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);     

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', '"id" with value "1" fails to match the required pattern: /^[0-9a-fA-F]{24}$/');
        })

        it('should return 404 if user not found', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            User.findById = jest.fn().mockReturnValueOnce(user);                

            const res = await exec(notificationId);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User Not Found');
        })
    })

    describe('GET /me/seapods', () => {
        let user, token;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const userId = mongoose.Types.ObjectId().toHexString();

        const exec = async () => {
            return await request(server)
            .get('/v1/api/users/me/seapods')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);
        }

        beforeEach(() => {
            user = new User({
                _id: userId,
                previousPasswords:[],
                profileImageUrl:"",
                seaPods:[{
                    _id: mongoose.Types.ObjectId().toHexString(),
                    SeaPodName: "SeaPod Name",
                    vessleCode: "S743355",
                }],
                isVerified:true,
                accessRequests:[],
                accessInvitation:[],
                firstName:"Name",
                lastName:"Name",
                email:"mail@company.com",
                mobileNumber:"+201111111111",
                password:"passworD@123",
                country:"Egypt",
                loginAuditTrials:[],
                notifications:[],
                actionHistorys:[],
                loginHistory:[],
                emergencyContacts:[],
                tokensAndDevices:[{
                    jti: jti,
                    hardwareId: 'anything',
                    notificationToken: 'token',
                    model: 'model'
                }],
            });
        })

        it("should return 200 if success in getting user's seapod", async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            const seapod = {
                seaPods:[{
                    _id: mongoose.Types.ObjectId().toHexString(),
                    SeaPodName: "SeaPod Name",
                    vessleCode: "S743355",
                    users: [{
                        _id: userId,
                        isDisabled: false,
                        userName: "name name",
                        profilePicUrl: "",
                        type: "OWNER",
                        notificationToken: 'x'
                    }],
                }],
            }

            User.findById = jest.fn()
            .mockReturnValueOnce(user)
            .mockImplementationOnce(() => ({
                populate: jest.fn().mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnValue(seapod)
                }))
            }));
            
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body[0]).toHaveProperty('SeaPodName');
            expect(res.body[0]).toHaveProperty('vessleCode');
        })

        it("should return 404 if user's seapod not found", async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            User.findById = jest.fn()
            .mockReturnValueOnce(user)
            .mockImplementationOnce(() => ({
                populate: jest.fn().mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnValueOnce({})
                }))
            }));

            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'SeaPods Not Found!');
        })
    })

    describe('PUT /emergency-contacts', () => {
        let user, token, body;
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (body) => {
            return await request(server)
            .put('/v1/api/users/emergency-contacts')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);
        }

        beforeEach(() => {
            user = new User({
                _id: mongoose.Types.ObjectId().toHexString(),
                previousPasswords:[],
                profileImageUrl:"",
                seaPods:[{
                    _id: mongoose.Types.ObjectId().toHexString(),
                }],
                isVerified:true,
                accessRequests:[],
                accessInvitation:[],
                firstName:"Name",
                lastName:"Name",
                email:"mail@company.com",
                mobileNumber:"+201111111111",
                password:"passworD@123",
                country:"Egypt",
                loginAuditTrials:[],
                notifications:[],
                actionHistorys:[],
                loginHistory:[],
                emergencyContacts:[],
                tokensAndDevices:[{
                    jti: jti,
                    hardwareId: 'anything',
                    notificationToken: 'token',
                    model: 'model'
                }],
            });

            body = {
                firstName: "Name",
                lastName: "Name",
                email: "email2@company.com",
                mobileNumber: "+201111111111"
            }
        })

        it('should return 400 if body is empty', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            User.findById = jest.fn().mockReturnValue(user);
            body = '';

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Emergency Contacts data required!');
        })

        it('should return 400 if emergency contact validaton failed', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            body.firstName = 'aa';

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it("should return 200 if success in add emergency contact", async () => {
            token = new User(user).generateAuthToken(jti);

            User.findById = jest.fn().mockReturnValue(user);

            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body[0]).toEqual(expect.objectContaining(body));
        })

        it("should return 404 if user not found", async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            User.findById = jest.fn()
            .mockReturnValueOnce(user)
            .mockReturnValueOnce();

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User Not Found!');
        })
    })

    describe('PUT /emergency-contacts/:id', () => {
        let user, token, body, contactId;
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async (body) => {
            return await request(server)
            .put('/v1/api/users/emergency-contacts/'+contactId)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);
        }

        beforeEach(() => {
            contactId = mongoose.Types.ObjectId().toHexString();

            user = new User({
                _id: mongoose.Types.ObjectId().toHexString(),
                previousPasswords:[],
                profileImageUrl:"",
                seaPods:[{
                    _id: mongoose.Types.ObjectId().toHexString(),
                }],
                isVerified:true,
                accessRequests:[],
                accessInvitation:[],
                firstName:"Name",
                lastName:"Name",
                email:"mail@company.com",
                mobileNumber:"+201111111111",
                password:"passworD@123",
                country:"Egypt",
                loginAuditTrials:[],
                notifications:[],
                actionHistorys:[],
                loginHistory:[],
                emergencyContacts:[{
                    _id: contactId,
                    firstName: "Modified",
                    lastName: "Name",
                    email: "email2@company.com",
                    mobileNumber: "+201111111111"
                }],
                tokensAndDevices:[{
                    jti: jti,
                    hardwareId: 'anything',
                    notificationToken: 'token',
                    model: 'model'
                }],
            });

            body = {
                _id: contactId,
                firstName: "Modified",
                lastName: "Name",
                email: "email2@company.com",
                mobileNumber: "+201111111111"
            }
        })

        it('should return 400 if body is empty', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            User.findById = jest.fn().mockReturnValue(user);
            body = '';

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Emergency Contacts data required!');
        })

        it('should return 400 if emergency contact validaton failed', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            body.firstName = 'aa';

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 400 if emergency contact Id is wrong', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            contactId = 1;

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it("should return 404 if user not found", async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            User.findOneAndUpdate = jest.fn().mockReturnValue();

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User Not Found!');
        })

        it("should return 200 if success in update emergency contact", async () => {
            token = new User(user).generateAuthToken(jti);
            User.findById = jest.fn().mockReturnValue(user);
            User.findOneAndUpdate = jest.fn().mockReturnValue(user);

            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body[0]).toEqual(body);
        })
    })

    describe('DELETE /emergency-contacts/:id', () => {
        let user, token, contactId;
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async () => {
            return await request(server)
            .delete('/v1/api/users/emergency-contacts/'+contactId)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);
        }

        beforeEach(() => {
            contactId = mongoose.Types.ObjectId().toHexString();

            user = new User({
                _id: mongoose.Types.ObjectId().toHexString(),
                previousPasswords:[],
                profileImageUrl:"",
                seaPods:[{
                    _id: mongoose.Types.ObjectId().toHexString(),
                }],
                isVerified:true,
                accessRequests:[],
                accessInvitation:[],
                firstName:"Name",
                lastName:"Name",
                email:"mail@company.com",
                mobileNumber:"+201111111111",
                password:"passworD@123",
                country:"Egypt",
                loginAuditTrials:[],
                notifications:[],
                actionHistorys:[],
                loginHistory:[],
                emergencyContacts:[{
                    _id: contactId,
                    firstName: "Name",
                    lastName: "Name",
                    email: "email@company.com",
                    mobileNumber: "+201111111111"
                }],
                tokensAndDevices:[{
                    jti: jti,
                    hardwareId: 'anything',
                    notificationToken: 'token',
                    model: 'model'
                }],
            });
        })

        it('should return 400 if emergency contact Id is wrong', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            contactId = 1;
            User.findById = jest.fn().mockReturnValue(user);

            const res = await exec();
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it("should return 404 if user not found", async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            User.findById = jest.fn()
            .mockReturnValueOnce(user)
            .mockReturnValueOnce();

            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User Not Found!');
        })

        it("should return 400 if contact is only one", async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            User.findById = jest.fn().mockReturnValue(user);

            const res = await exec();
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Your are not allowed to remove all emergency contacts');
        })

        it("should return 200 if success in delete emergency contact", async () => {
            user.emergencyContacts = [{
                _id: contactId,
                firstName: "Name",
                lastName: "Name",
                email: "email@company.com",
                mobileNumber: "+201111111111"
            },
            {   _id: mongoose.Types.ObjectId().toHexString(),
                firstName: "Name2",
                lastName: "Name2",
                email: "email2@company.com",
                mobileNumber: "+201111111111"
            }]
            
            token = new User(user).generateAuthToken(jti)
            User.findById = jest.fn().mockReturnValue(user);
            
            const res = await exec();
            expect(res.status).toBe(200);
        })
    })
});