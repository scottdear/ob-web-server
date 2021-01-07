const request = require('supertest');
const { User } = require('../../models/users/user');
const { Admin } = require('../../models/users/admin');
const { SeaPod } = require('../../models/seapod/seapod');
const { Permission } = require('../../models/permission/permission');
let server;

jest.useFakeTimers()

describe('/api/admins', () => {
    beforeEach(() => { server = require('../../index'); })
    afterEach(async () => {
        server.close();
        await User.deleteMany({});
        await Admin.deleteMany({});
        await SeaPod.deleteMany({});
        await Permission.deleteMany({});
    }); 

    describe('POST /registration', () => {
        let body;

        const exec = async (reqBody) => {
            return await request(server)
            .post('/v1/api/admins/registration')
            .send(reqBody);
        }

        beforeEach(() => {
            body = {
                firstName: "Name",
                lastName: "Name",
                email: "mail@company.com",
                mobileNumber: "+201111111111",
                password: "passworD@123",
                country: "Egypt"
            }
        })

        it('should return 400 if body is empty', async () => {
            body = '';
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'registration data are required!');
        })

        it('should return 400 if validation of user faild', async () => {
            body.firstName = 'aa';
            const res = await exec(body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        })

        // We changed the logic
        // it('should return 200 if success in create admin', async () => {
        //     const res = await exec(body);

        //     expect(res.status).toBe(200);
        //     expect(res.body).toHaveProperty('otpAuthImage');
        //     expect(res.body).toHaveProperty('secret');
        // })
    })

});