const request = require('supertest');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

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

    describe('POST /:seapodId', () => {
        let user, token, body, seapod;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const userId = mongoose.Types.ObjectId().toHexString();

        const exec = async (body) => {
            return await request(server)
            .post('/v1/api/permissions/' + seapodId)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);
        }

        beforeEach(() => {
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: [],
            }

            seapod = {
                _id: seapodId,
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                permissionSets: [],
                save: jest.fn().mockReturnValue(),
            }

            body = {
                Name: "new permission set",
                Sets: []
            }
        })

        it('should return 400 if body is empty', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            User.findById = jest.fn().mockReturnValue(user);

            body = '';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'permission data is required!');
        })

        it('should return 400 if seapod Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await request(server)
            .post('/v1/api/permissions/1')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Seapod ID!');
        })

        it('should return 400 if permission name validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            User.findById = jest.fn().mockReturnValue(user);

            body.Name = 'aa';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        it('should return 401 if no token is provided', async () => {
            token = '';

            const res = await exec(body);
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access denied. No token provided');
        })
        
        it('should return 403 if forbidden', async () => {
            token = new User(user).generateAuthToken(null);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec(body);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Forbidden. Access denied!');
        })

        it('should return 400 if invalid token', async () => {
            token = 'x';

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Token');
        })

        it('should return 404 if seapod not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce('')
            }));

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'SeaPod Not Found!');
        })
        
        it("should return 403 if user not seapod's owner", async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.users = [];
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(body);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Not the Owner of the seapod!');
        })

        it('should return 400 if duplicated permission name is found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.permissionSets = [{
                Name: 'new permission set'
            }]
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Duplicated Permission Name!');
        })

        it('should return 201 if success in add new permission', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(body);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('isDefault', false);
            expect(res.body).toHaveProperty('Name', 'new permission set');
            expect(res.body).toHaveProperty('Sets');
        })
        
        it('should return 500 if error occurs', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockImplementationOnce(() => {
                throw new Error ('AN ERROR');
            });

            const res = await exec(body);
            expect(res.status).toBe(500);
        })
    })

    describe('PUT /:seapodId', () => {
        let user, token, body, seapod;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const permissionId = mongoose.Types.ObjectId().toHexString();
        const userId = mongoose.Types.ObjectId().toHexString();

        const exec = async (body) => {
            return await request(server)
            .put('/v1/api/permissions/' + seapodId)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)

            .send(body);
        }

        beforeEach(() => {
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: [],
            }

            seapod = {
                _id: seapodId,
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                permissionSets: [{
                    _id: permissionId,
                    Name: 'new permission set'
                }],
                save: jest.fn().mockReturnValue(),
            }

            body = {
                _id: permissionId,
                Name: "updated permission set",
                Sets: []
            }
        })

        it('should return 400 if body is empty', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            User.findById = jest.fn().mockReturnValue(user);

            body = '';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'permission data is required!');
        })

        it('should return 400 if seapod Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await request(server)
            .put('/v1/api/permissions/1')
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Seapod ID!');
        })

        it('should return 400 if permission name validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            User.findById = jest.fn().mockReturnValue(user);

            body.Name = 'aa';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })
        
        it('should return 404 if seapod not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce('')
            }));

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'SeaPod Not Found!');
        })
        
        it("should return 403 if user not seapod's owner", async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.users = [];
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(body);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Not the Owner of the seapod!');
        })
        
        it('should return 404 if permission not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.permissionSets = [{}];
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Permission Not Found');
        })

        it('should return 400 if permission is default', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            seapod.permissionSets=[{
                _id: mongoose.Types.ObjectId().toHexString(),
                Name: 'updated permission set'
            }, {
                _id: permissionId,
                Name: 'new permission set'
            }]
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            Permission.findById = jest.fn().mockReturnValueOnce({
                isDefault: true,
            });

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Default Permission cannot be renamed!');
        })

        it('should return 400 if duplicated permission name is found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            seapod.permissionSets=[{
                _id: mongoose.Types.ObjectId().toHexString(),
                Name: 'updated permission set'
            }, {
                _id: permissionId,
                Name: 'new permission set'
            }]
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            Permission.findById = jest.fn().mockReturnValueOnce(seapod.permissionSets[1]);

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Duplicated Permission Name!');
        })

        it('should return 200 if success in update permission', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            seapod.permissionSets=[{
                _id: mongoose.Types.ObjectId().toHexString(),
                Name: 'updated permission set'
            }, {
                _id: permissionId,
                Name: 'new permission set'
            }]
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            Permission.findById = jest.fn().mockReturnValueOnce(seapod.permissionSets[0]);

            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('Name', 'updated permission set');
            expect(res.body).toHaveProperty('Sets');
        })
        
        it('should return 500 if error occurs', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockImplementationOnce(() => {
                throw new Error ('AN ERROR');
            });

            const res = await exec(body);
            expect(res.status).toBe(500);
        })
    })

    describe('PUT /:permissionId/seapod/:seapodId/name', () => {
        let user, token, body, seapod;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const permissionId = mongoose.Types.ObjectId().toHexString();
        const userId = mongoose.Types.ObjectId().toHexString();

        const exec = async (body) => {
            return await request(server)
            .put(`/v1/api/permissions/${permissionId}/seapod/${seapodId}/name`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);
        }

        beforeEach(() => {
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: [],
            }

            seapod = {
                _id: seapodId,
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                permissionSets: [{
                    _id: permissionId,
                    Name: 'new permission set'
                }],
                save: jest.fn().mockReturnValue(),
            }

            body = {
                Name: "updated permission set",
            }
        })

        it('should return 400 if body is empty', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            User.findById = jest.fn().mockReturnValue(user);

            body = '';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Permission name is required!');
        })

        it('should return 400 if seapod Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await request(server)
            .put(`/v1/api/permissions/${permissionId}/seapod/1/name`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Seapod ID!');
        })

        it('should return 400 if permission Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await request(server)
            .put(`/v1/api/permissions/1/seapod/${seapodId}/name`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Permission ID!');
        })

        it('should return 400 if permission name validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            User.findById = jest.fn().mockReturnValue(user);

            body.Name = 'aa';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })
        
        it('should return 404 if seapod not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce('')
            }));

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'SeaPod Not Found!');
        })
        
        it("should return 403 if user not seapod's owner", async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.users = [];
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(body);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Not the Owner of the seapod!');
        })
        
        it('should return 404 if permission not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.permissionSets = [{}];
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Permission Not Found');
        })

        it('should return 400 if permission is default', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            seapod.permissionSets=[{
                _id: mongoose.Types.ObjectId().toHexString(),
                Name: 'updated permission set'
            }, {
                _id: permissionId,
                Name: 'new permission set'
            }]
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            Permission.findById = jest.fn().mockReturnValueOnce({
                isDefault: true,
            });

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Default Permission cannot be renamed!');
        })

        it('should return 400 if duplicated permission name is found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            seapod.permissionSets=[{
                _id: mongoose.Types.ObjectId().toHexString(),
                Name: 'updated permission set'
            }, {
                _id: permissionId,
                Name: 'new permission set'
            }]
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            Permission.findById = jest.fn().mockReturnValueOnce(seapod.permissionSets[1]);

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Duplicated Permission Name!');
        })

        it('should return 200 if success in update permission', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            seapod.permissionSets=[{
                _id: mongoose.Types.ObjectId().toHexString(),
                Name: 'updated permission set',
                Sets: [],
                save: jest.fn().mockReturnValueOnce()
            }, {
                _id: permissionId,
                Name: 'new permission set'
            }]
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            Permission.findById = jest.fn().mockReturnValueOnce(seapod.permissionSets[0]);

            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('Name', 'updated permission set');
            expect(res.body).toHaveProperty('Sets');
        })
    })

    describe('DELETE /:permissionId/seapod/:seapodId/name', () => {
        let user, token, seapod;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const permissionId = mongoose.Types.ObjectId().toHexString();
        const userId = mongoose.Types.ObjectId().toHexString();

        const exec = async () => {
            return await request(server)
            .delete(`/v1/api/permissions/${permissionId}/seapod/${seapodId}`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);
        }

        beforeEach(() => {
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: [],
            }

            seapod = {
                _id: seapodId,
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                permissionSets: [{
                    _id: permissionId,
                    Name: 'new permission set'
                }],
                save: jest.fn().mockReturnValue(),
            }
        })

        it('should return 400 if seapod Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);

            const res = await request(server)
            .delete(`/v1/api/permissions/${permissionId}/seapod/1`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Seapod ID!');
        })

        it('should return 400 if permission Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await request(server)
            .delete(`/v1/api/permissions/1/seapod/${seapodId}`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Permission ID!');
        })
        
        it('should return 404 if seapod not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce('')
            }));

            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'SeaPod Not Found!');
        })
        
        it("should return 403 if user not seapod's owner", async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.users = [];
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec();
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Not the Owner of the seapod!');
        })
        
        it('should return 404 if permission not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.permissionSets = [{}];
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Permission Not Found');
        })

        it('should return 400 if permission is default', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            Permission.findById = jest.fn().mockReturnValueOnce({
                isDefault: true,
            });

            const res = await exec();
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Default Permission cannot be deleted!');
        })

        it('should return 200 if success in update permission', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));
            Permission.findById = jest.fn().mockReturnValueOnce(seapod.permissionSets[0]);
            Permission.findByIdAndDelete = jest.fn().mockReturnValueOnce();
            SeaPod.updateOne = jest.fn().mockReturnValueOnce();

            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('Name', 'new permission set');
        })
    })

    describe('POST /:seapodId/user', () => {
        let user, token, seapod, body;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const permissionId = mongoose.Types.ObjectId().toHexString();
        const userId = mongoose.Types.ObjectId().toHexString();

        const exec = async (body) => {
            return await request(server)
            .post(`/v1/api/permissions/${seapodId}/user`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);
        }

        beforeEach(() => {
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: [],
            }

            seapod = {
                _id: seapodId,
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                permissionSets: [{
                    _id: permissionId,
                    Name: 'new permission set'
                }],
                save: jest.fn().mockReturnValue(),
                populate: jest.fn().mockImplementationOnce(() => ({
                    execPopulate: jest.fn().mockReturnValue()
                }))
            }
            
            body = {
                userId: userId,
                permissionId: permissionId
            }
        })

        it('should return 400 if body is empty', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            User.findById = jest.fn().mockReturnValue(user);

            body = '';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Data is required!');
        })

        it('should return 400 if seapod Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await request(server)
            .post(`/v1/api/permissions/1/user`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Seapod ID!');
        })

        it('should return 400 if user Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            body.userId = 1;

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid User ID!');
        })

        it('should return 400 if permission Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            body.permissionId = 1;

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Permission ID!');
        })
       
        it('should return 404 if seapod not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce('')
            }));

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'SeaPod Not Found!');
        })
        
        it("should return 403 if user not seapod's owner", async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.users = [];
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(body);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Not the Owner of the seapod!');
        })
        
        it('should return 404 if permission not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.permissionSets = [{}];
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Permission Not Found');
        })

        it('should return 404 if user is not at seapod', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));
            Permission.findById = jest.fn().mockReturnValueOnce(seapod.permissionSets[0]);

            body.userId = mongoose.Types.ObjectId().toHexString();

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User is not at Seapod');
        })

        it('should return 200 if success in update permission', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));
            Permission.findById = jest.fn().mockReturnValueOnce(seapod.permissionSets[0]);

            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('permissionSet', permissionId);
        })
    })

    describe('DELETE /:seapodId/user', () => {
        let user, token, seapod, body;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const permissionId = mongoose.Types.ObjectId().toHexString();
        const defaultPermissionId = mongoose.Types.ObjectId().toHexString();
        const userId = mongoose.Types.ObjectId().toHexString();

        const exec = async (body) => {
            return await request(server)
            .delete(`/v1/api/permissions/${seapodId}/user`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);
        }

        beforeEach(() => {
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: [],
            }

            seapod = {
                _id: seapodId,
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                permissionSets: [{
                    _id: permissionId,
                    Name: 'new permission set'
                },
                {   _id: defaultPermissionId,
                    Name: 'Default OWNER Permissions'                    
                }],
                save: jest.fn().mockReturnValue(),
                populate: jest.fn().mockImplementationOnce(() => ({
                    execPopulate: jest.fn().mockReturnValue()
                }))
            }
            
            body = {
                userId: userId
            }
        })

        it('should return 400 if body is empty', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            User.findById = jest.fn().mockReturnValue(user);

            body = '';
            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Data is required!');
        })

        it('should return 400 if seapod Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await request(server)
            .delete(`/v1/api/permissions/1/user`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId)
            .send(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Seapod ID!');
        })

        it('should return 400 if user Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            body.userId = 1;

            const res = await exec(body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid User ID!');
        })
       
        it('should return 404 if seapod not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce('')
            }));

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'SeaPod Not Found!');
        })
        
        it("should return 403 if user not seapod's owner", async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            seapod.users = [];
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec(body);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Not the Owner of the seapod!');
        })
        
        it('should return 404 if user is not at seapod', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));
            Permission.findById = jest.fn().mockReturnValueOnce(seapod.permissionSets[0]);

            body.userId = mongoose.Types.ObjectId().toHexString();

            const res = await exec(body);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User is not at Seapod');
        })

        it('should return 200 if success in update permission', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));
            Permission.findById = jest.fn().mockReturnValueOnce(seapod.permissionSets[0]);

            const res = await exec(body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('permissionSet', defaultPermissionId);
        })
    })

    describe('GET /:seapodId/seapod', () => {
        let user, token, seapod;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const seapodId = mongoose.Types.ObjectId().toHexString();
        const permissionId = mongoose.Types.ObjectId().toHexString();
        const userId = mongoose.Types.ObjectId().toHexString();

        const exec = async () => {
            return await request(server)
            .get(`/v1/api/permissions/${seapodId}/seapod`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);
        }

        beforeEach(() => {
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: [],
            }

            seapod = {
                _id: seapodId,
                users: [{
                    _id: userId,
                    isDisabled: false,
                    userName: "name name",
                    profilePicUrl: "",
                    type: "OWNER",
                    notificationToken: 'x',
                }],
                permissionSets: [{
                    _id: permissionId,
                    Name: 'new permission set'
                }],
            }
        })

        it('should return 400 if seapod Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            
            User.findById = jest.fn().mockReturnValue(user);

            const res = await request(server)
            .get(`/v1/api/permissions/1/seapod`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Seapod ID!');
        })

        it('should return 404 if seapod not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce('')
            }));

            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'SeaPod Not Found!');
        })
        
        it('should return 200 if success in update permission', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            User.findById = jest.fn().mockReturnValue(user);
            SeaPod.findById = jest.fn().mockImplementationOnce(()=> ({
                populate: jest.fn().mockReturnValueOnce(seapod)
            }));

            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body[0]).toHaveProperty('_id', permissionId);
        })
    })

    describe('GET /:permissionId', () => {
        let user, token;
        const jti = uuidv4();
        const hardwareId = 'anything';
        const permissionId = mongoose.Types.ObjectId().toHexString();
        const userId = mongoose.Types.ObjectId().toHexString();

        const exec = async () => {
            return await request(server)
            .get(`/v1/api/permissions/${permissionId}`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);
        }

        beforeEach(() => {
            user = {
                _id: userId,
                jti: jti,
                tokensAndDevices: [],
            }
        })

        it('should return 400 if seapod Id validation failed', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });
            
            User.findById = jest.fn().mockReturnValue(user);

            const res = await request(server)
            .get(`/v1/api/permissions/1`)
            .set('x-auth-token', token)
            .set('hardwareId', hardwareId);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid Permission ID!');
        })

        it('should return 200 if success in update permission', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            const res = await exec();
            expect(res.status).toBe(200);
        })
        
        it('should return 404 if permission not found', async () => {
            token = new User(user).generateAuthToken(user.jti);
            user.tokensAndDevices.push({
                jti: jti,
                hardwareId: 'anything'
            });

            Permission.findById = jest.fn().mockReturnValueOnce();

            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Permission Not Found!');
        })
    })
});