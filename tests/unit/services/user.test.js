const { UserService } = require('../../../services/user');
const { User } = require('../../../models/users/user');

const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const config = require('config');

describe('user service', () => {
    describe('getAllUsers method', () => {
        it('should return all users with filtered token and devices', async () => {
            const users = [{
                _id: mongoose.Types.ObjectId().toHexString(),
                tokensAndDevices:[{
                    jti: uuidv4(),
                    hardwareId: 'anything',
                    notificationToken: 'token',
                    model: 'model'
                },
                {
                    jti: uuidv4(),
                    hardwareId: 'anything2',
                    notificationToken: 'token2',
                    model: 'model2'
                }]
            },
            {
                _id: mongoose.Types.ObjectId().toHexString(),
                tokensAndDevices:[{
                    jti: uuidv4(),
                    hardwareId: 'anything3',
                    notificationToken: 'token3',
                    model: 'model3'
                }]
            }];

            User.find = jest.fn().mockImplementationOnce(() => ({
                select: jest.fn().mockImplementationOnce(() => ({
                    populate: jest.fn().mockImplementationOnce(() => ({
                        populate: jest.fn().mockImplementationOnce(() => ({
                            populate: jest.fn().mockReturnValueOnce(users)
                        }))
                    }))
                }))
            }));
            
            const userService = new UserService();
            const res = await userService.getAllUsers();

            expect(res.length).toEqual(2);
            expect(res[0]).toHaveProperty('tokensAndDevices');
        })
    })

    describe('indexOf method', () => {
        it('should return index of emergancy contact', () => {
            const contactId = mongoose.Types.ObjectId().toHexString();

            const emergencyContacts = [ {
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
                mobileNumber: "+201111111112"
            }];
            
            const userService = new UserService();
            const res = userService.indexOf(emergencyContacts, contactId);

            expect(res).toEqual(0);
        })
    })

    describe('isExist method', () => {
        it('should return true if user exists', async () => {
            const emailAddress = 'mail@company.com';
            User.exists = jest.fn().mockReturnValueOnce(true);

            const userService = new UserService();
            const res = await userService.isExist(emailAddress);

            expect(res).toBe(true);
        })

        it('should return false if user does not exist', async () => {
            const emailAddress = 'falseEmail@company.com';
            User.exists = jest.fn().mockReturnValueOnce(false);

            const userService = new UserService();
            const res = await userService.isExist(emailAddress);

            expect(res).toBe(false);
        })
    })

    describe('invalidateToken and invalidateAllToken methods', () => {
        let user;
        const jti = uuidv4();
        const userId = mongoose.Types.ObjectId().toHexString();

        beforeAll(async() => {
            await mongoose.connect(config.get('db'), {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify:false,
                replicaSet: 'rs'
            });
        })

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

        afterEach(async () => {
            await User.deleteMany({});
        })

        it('should return 404 if user not found', async () => {
            await user.save();

            const userService = new UserService();
            const res = await userService.invalidateToken();

            expect(res.statusCode).toBe(404);
            expect(res.error).toBe('User Not Found');
        })

        it('should return 200 if success in invalidate one token', async () => {
            await user.save();

            const userService = new UserService();
            const res = await userService.invalidateToken(userId, jti);

            expect(res.statusCode).toBe(200);
            expect(res.message).toBe('logged out successfully');
        })

        it('should return 400 if error occurs', async () => {
            await user.save();
            User.updateOne = jest.fn().mockImplementationOnce(() => {
                throw new Error ('AN ERROR');
            });

            const userService = new UserService();
            const res = await userService.invalidateToken(userId, jti);

            expect(res.statusCode).toBe(400);
            expect(res.error).toBe('error logging out');
        })

        it('should return 404 if user not found', async () => {
            await user.save();

            const userService = new UserService();
            const res = await userService.invalidateAllToken();

            expect(res.statusCode).toBe(404);
            expect(res.error).toBe('User Not Found');
        })

        it('should return 200 if success in invalidate one token', async () => {
            await user.save();

            const userService = new UserService();
            const res = await userService.invalidateAllToken(userId);

            expect(res.statusCode).toBe(200);
            expect(res.message).toBe('logged out successfully');
        })

        it('should return 400 if error occurs', async () => {
            await user.save();
            User.updateOne = jest.fn().mockImplementationOnce(() => {
                throw new Error ('AN ERROR');
            });

            const userService = new UserService();
            const res = await userService.invalidateAllToken(userId);

            expect(res.statusCode).toBe(400);
            expect(res.error).toBe('error logging out');
        })
    })
});