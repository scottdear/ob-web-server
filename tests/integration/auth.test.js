const request = require('supertest');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const { User } = require('../../models/users/user');
const { SeaPod } = require('../../models/seapod/seapod');
const { Permission } = require('../../models/permission/permission');
let server;

describe('/api/auth', () => {
    beforeAll(async () => {
        jest.setTimeout(10000000);
    })

    beforeEach(() => { server = require('../../index'); })
    afterEach(async () => {
        server.close();
        await SeaPod.deleteMany({});
        await User.deleteMany({});
        await Permission.deleteMany({});
    }); 

    describe('POST /', () => {
        let body;
        const notificationToken = 'token';
        const hardwareId = 'anything';
        const model = 'model';

        const exec = async (reqBody) => {
            return await request(server)
            .post('/v1/api/auth/')
            .set('notificationToken', notificationToken)
            .set('hardwareId', hardwareId)
            .set('model', model)
            .send(reqBody);
        }

        beforeEach(() => {
            body = {
                user: {
                    firstName: "Name",
                    lastName: "Name",
                    email: "mail@company.com",
                    mobileNumber: "+201111111111",
                    password: "passworD@123",
                    country: "Egypt"
                },
                seaPod: {
                    SeaPodName: "SeaPod Name",
                    exteriorFinish: "exfinish",
                    exterioirColor: "0xff3399FF",
                    sparFinish: "sparFinish",
                    sparDesign: "sparDesign",
                    deckEnclosure: "deckEnclosure",
                    bedAndLivingRoomEnclousure: "bedAndLivingRoomEnclousure",
                    power: "power",
                    powerUtilities: [],
                    underWaterRoomFinishing: "underWaterRoomFinishing",
                    underWaterWindows: "underWaterWindows",
                    soundSystem: [],
                    masterBedroomFloorFinishing: [],
                    masterBedroomInteriorWallColor: "0xff3399FF",
                    livingRoomloorFinishing: "livingRoomloorFinishing",
                    livingRoomInteriorWallColor: "0xff3399FF",
                    kitchenfloorFinishing: "kitchenfloorFinishing",
                    kitchenInteriorWallColor: "0xff3399FF",
                    hasWeatherStation: false,
                    entryStairs: true,
                    hasFathometer: false,
                    hasCleanWaterLevelIndicator: false,
                    interiorBedroomWallColor: "0xff3399FF",
                    deckFloorFinishMaterial: "deckFloorFinishMaterial",
                    seaPodStatus: "seaPodStatus"
                }
            }
        })

        it('should return 500 if params is missing', async () => {
            const res = await request(server)
            .post('/v1/api/auth/')
            .set('hardwareId', hardwareId)
            .set('model', model)
            .send(body);

            expect(res.status).toBe(500);
        })

        it('should return 500 if email is duplicated', async () => {
            await exec(body);
            const res = await exec(body);

            expect(res.status).toBe(500);
        })

        it('should return 400 if body is empty', async () => {
            body = {};
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'user and sea pod data are required');
        })

        it('should return 400 if user is missing', async () => {
            body.user = null;
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'user data are required');
        })

        it('should return 400 if seaPod is missing', async () => {
            body.seaPod = null;
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'seaPod data are required');
        })

        it('should return 400 if user validation failed', async () => {
            body.user.firstName = "aa";
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 400 if seaPod validation failed', async () => {
            body.user.SeaPodName = "aaa";
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 200 if success', async () => {
            const res = await exec(body);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('seaPods');
            expect(res.body).toHaveProperty('accessRequests');
            expect(res.body).toHaveProperty('accessInvitation');
            expect(res.body).toHaveProperty('firstName', 'Name');
            expect(res.header).toHaveProperty('x-auth-token');
        })
    })

    describe('PUT /', () => {
        let body, user;
        const jti = uuidv4();
        const notificationToken = 'token';
        const hardwareId = 'anything';
        const model = 'model';

        const exec = async (reqBody) => {
            return await request(server)
            .put('/v1/api/auth/')
            .set('notificationToken', notificationToken)
            .set('hardwareId', hardwareId)
            .set('model', model)
            .send(reqBody);
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
                email: "mail@company.com",
                password: "passworD@123"
            }
        })
        
        it('should return 400 if email is missing', async () => {
            body = {};
            const res = await exec(body);
            
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', '"email" is required');
        })

        it('should return 400 if password is missing', async () => {
            body.password = null;
            const res = await exec(body);
            
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', '"password" must be a string');
        })
        
        it('should return 400 if email does not exist in db', async () => {
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid email or password');
        })
        
        it('should return 400 if password is wrong', async () => {  
            await user.save();
            bcrypt.compare = jest.fn().mockReturnValueOnce(false);
            
            const res = await exec(body);
            
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid email or password');
        })

        it('should return 200 if success', async () => {  
            await user.save();
            bcrypt.compare = jest.fn().mockReturnValueOnce(true);

            const res = await exec(body);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('seaPods');
            expect(res.body).toHaveProperty('accessRequests');
            expect(res.body).toHaveProperty('accessInvitation');
            expect(res.body).toHaveProperty('firstName', 'Name');
            expect(res.header).toHaveProperty('x-auth-token');
        })
    })

    describe('GET /me', () => {
        let user, token;
        const jti = uuidv4();
        const hardwareId = 'anything';

        const exec = async () => {
            return await request(server)
            .get('/v1/api/auth/me')
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

        it('should return 401 if no token is provided', async () => {
            const res = await request(server)
            .get('/v1/api/auth/me')
            .set('hardwareId', hardwareId); 
            
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
            .get('/v1/api/auth/me')
            .set('x-auth-token', 'x')
            .set('hardwareId', hardwareId);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Token');
        })

        it('should return 200 if success', async () => {  
            await user.save();
            token = new User(user).generateAuthToken(jti);

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('seaPods');
            expect(res.body).toHaveProperty('accessRequests');
            expect(res.body).toHaveProperty('accessInvitation');
            expect(res.body).toHaveProperty('firstName', 'Name');
        })

        /*it('should return 404 if user not found', async () => {
            token = new User(user).generateAuthToken(jti);
            User.findById = jest.fn()
                .mockReturnValueOnce(user)
                .mockImplementationOnce(() => {
                    
                });

            const res = await exec();
            console.log(res.body.message);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User Not found!');
        })*/
    })
});