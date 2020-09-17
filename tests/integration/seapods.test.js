const request = require('supertest');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const { User } = require('../../models/users/user');
// const { Admin } = require('../../models/users/admin');
const { SeaPod } = require('../../models/seapod/seapod');
const { Permission } = require('../../models/permission/permission');
let server;

describe('/api/seapods', () => {
    beforeAll(async () => {
        jest.setTimeout(10000000);
    })

    beforeEach(() => { server = require('../../index'); })

    afterEach(async () => {
        server.close();
        await SeaPod.deleteMany({});
        await User.deleteMany({});
        // await Admin.deleteMany({});
        await Permission.deleteMany({});
    })

    describe('POST /', () => {
        let user, token, body;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const userId = mongoose.Types.ObjectId().toHexString();

        const exec = async (reqBody) => {
            return await request(server)
            .post('/v1/api/seapods')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(reqBody);
        }

        beforeEach(() => {
            user = new User({
                _id: userId,
                previousPasswords:[],
                profileImageUrl:"",
                seaPods:[],
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
        })

        it('should return 400 if body is empty', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            User.findById = jest.fn().mockReturnValue(user);
            
            body = '';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Seapod data is required!');
        })

        it('should return 400 if seapod validation failed', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            body.SeaPodName = 'aa';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', '"SeaPodName" length must be at least 5 characters long');
        })
        
        it('should return 200 if success', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body.seaPods[0].user).toHaveProperty('_id', userId);
        })
        
        it('should return 500 if error occurs', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            User.findById = jest.fn().mockReturnValueOnce(user)
            .mockImplementationOnce(() => {
                throw new Error ('AN ERROR');
            });
            
            const res = await exec(body);
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message');
        })
    })

    //Admin middleware
    /*describe('GET /', () => {
        const exec = async () => {
            return await request(server)
            .post('/v1/api/seapods')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);
        }
    })

    describe('GET /:id', () => {
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const exec = async () => {
            return await request(server)
            .post('/v1/api/seapods' + seapodId)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);
        }
    })*/

    describe('PUT /:id/name', () => {
        let user, token, body;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const userId = mongoose.Types.ObjectId().toHexString();
        const seapodId = mongoose.Types.ObjectId().toHexString();

        const exec = async (reqBody) => {
            return await request(server)
            .put('/v1/api/seapods/'+seapodId+'/name')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(reqBody);
        }

        beforeEach(() => {
            user = new User({
                _id: userId,
                previousPasswords:[],
                profileImageUrl:"",
                seaPods:[],
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
                seapodName: 'Updated SeaPod Name!'
            }
        })

        it('should return 400 if seapod Id in invalid', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            User.findById = jest.fn().mockReturnValue(user);

            const res = await request(server)
                .put('/v1/api/seapods/1/name')
                .set('x-auth-token', token)
                .set('hardwareId', hardwareId)
                .send(body);
            
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid seapod id!');
        })

        it('should return 400 if body is empty', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            body = '';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Seapod name is required!');
        })

        it('should return 400 if seapod name validation failed', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            body.SeapodName = 'aa';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })
        
        it('should return 404 if seapod not found', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Seapod not found!');
        })
        
        it('should return 403 if user is not the owner', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            const seapod = { 
                users: [{
                    _id: mongoose.Types.ObjectId().toHexString(),
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x'
                }]
            };
            SeaPod.findById = jest.fn().mockReturnValueOnce(seapod);

            const res = await exec(body);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Access denied. you are not allowed to update the seapod name!');
        })

        it('should return 200 if success', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            const seapod = { 
                users: [{
                    _id: userId,
                    userName: "name name",
                    type: "OWNER",
                }],
                save: jest.fn().mockReturnValueOnce()
            };
            SeaPod.findById = jest.fn().mockReturnValueOnce(seapod);

            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body[0]).toHaveProperty('SeaPodName', 'Updated SeaPod Name!');
            expect(res.body[0]).toHaveProperty('users', seapod.users);
        })
    })

    describe('PUT /:seapodId/users/:userId', () => {
        let user, token;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const userId = mongoose.Types.ObjectId().toHexString();
        const seapodId = mongoose.Types.ObjectId().toHexString();

        const exec = async () => {
            return await request(server)
            .put('/v1/api/seapods/'+seapodId+'/users/'+userId)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);
        }

        beforeEach(() => {
            user = new User({
                _id: userId,
                previousPasswords:[],
                profileImageUrl:"",
                seaPods:[],
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

        it('should return 400 if seapod Id in invalid', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            User.findById = jest.fn().mockReturnValue(user);

            const res = await request(server)
                .put('/v1/api/seapods/1/users/'+userId)
                .set('x-auth-token', token)
                .set('hardwareId', hardwareId);
            
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid seapod id!');
        })

        it('should return 400 if user Id in invalid', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);
            
            const res = await request(server)
                .put('/v1/api/seapods/'+seapodId+'/users/1')
                .set('x-auth-token', token)
                .set('hardwareId', hardwareId);
            
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid user id!');
        })
        
        it('should return 404 if seapod not found', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Seapod Not found!');
        })
        
        it('should return 403 if user is not the owner', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            const seapod = { 
                users: [{
                    _id: mongoose.Types.ObjectId().toHexString(),
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x'
                }]
            };
            SeaPod.findById = jest.fn().mockReturnValueOnce(seapod);

            const res = await exec();
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Your are not allowed to take this action on the current seapod');
        })

        it('should return 200 if success', async () => {
            await user.save();
            token = new User(user).generateAuthToken(jti);

            const seapod = { 
                users: [{
                    _id: userId,
                    userName: "name name",
                    type: "OWNER",
                    isDisabled: true
                }],
                save: jest.fn().mockReturnValueOnce()
            };
            SeaPod.findById = jest.fn().mockReturnValueOnce(seapod);

            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body[0]).toHaveProperty('isDisabled', false);
        })
    })
})