const { Admin } = require('../models/users/admin');
const { VerificationToken } = require('../models/users/verificationToken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const mongoose = require('mongoose');
const speakeasy = require('speakeasy');
const config=require('config');
const { v4: uuidv4 } = require('uuid');
const { AuthService } = require('./auth');

const slatRounds = parseInt(config.get('adminSalt'));

class AdminService {
    async createAdmin(adminData) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const admin = new Admin(adminData);

            const salt = await bcrypt.genSalt(slatRounds);
            admin.password = await bcrypt.hash(admin.password, salt);

            const jti = uuidv4();
            const adminJwt = await admin.generateAuthToken(jti);

            admin.tokensAndDevices.push({
                jti: jti,
                notificationToken: adminData.notificationToken,
                hardwareId: adminData.hardwareId,
                model: adminData.model,
            });

            admin.actionHistorys.push({
                action: "Account Registration",
                actionResult: "SUCCEESED",
                tokenAndDeviceId: admin._id,
                itemId: admin._id,
            });
            
            await admin.save();
            await session.commitTransaction();

            return {
                isError: false,
                admin: _.pick(admin, ["firstName", "lastName", "email", "mobileNumber", "country"]),
                jwtoken: adminJwt
            };
        } catch (error) {
            await session.abortTransaction();
            return {
                isError: true,
                statusCode: 400,
                error: error.message
            }
        } finally {
            session.endSession();
        }
    }

    async login(obj) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const admin = await Admin.findOne({
                email: obj.email
            });
            if (!admin) return {
                isError: true,
                statusCode: 400,
                error: "Invalid email or password"
            }

            const isValidPassword = await bcrypt.compare(obj.password, admin.password);
            //TODO: enhance faild senario here
            if (!isValidPassword) return {
                isError: true,
                statusCode: 400,
                error: "Invalid email or password"
            }

            const jti = uuidv4();
            const adminJwt = admin.generateAuthToken(jti);

            const auth = new AuthService();
            const tokenAndDeviceId = auth.logReturnTokenAndDeviceId(obj, jti, admin.tokensAndDevices);

            admin.actionHistorys.push({
                action: "Account LOGIN",
                actionResult: "SUCCEESED",
                tokenAndDeviceId: tokenAndDeviceId,
                itemId: admin._id,
            });

            // const otpAuth = await admin.generateAuthQrCode();
            // const verificationToken = new VerificationToken({
            //     _userId: admin._id,
            //     token: otpAuth.secret
            // });

            await admin.save();
            // await verificationToken.save();
            await session.commitTransaction();

            return {
                isError: false,
                admin: _.pick(admin, ["firstName", "lastName", "email", "mobileNumber", "country"]),
                jwtoken: adminJwt
            };
        } catch (error) {
            await session.abortTransaction();
        } finally {
            session.endSession();
        }
    }

    async autoLogin(adminId) {
        const admin = await Admin.findById(adminId);
        if (!admin) return {
            isError: true,
            statusCode: 400,
            error: 'Invalid Token!'
        }

        return {
            isError: false,
            admin: _.pick(admin, ["firstName", "lastName", "email", "mobileNumber", "country"]),
        }
    }

    async verifiyOtp(req) {
        const verificationToken = await VerificationToken.findOne({
            token: req.secret
        });
        if (!verificationToken) return {
            isError: true,
            statusCode: 400,
            error: "Invalid secret,try to relogin!"
        }

        const verified = speakeasy.totp.verify({
            secret: req.secret,
            encoding: 'ascii',
            token: req.token
        });

        if (!verified) return {
            isError: true,
            statusCode: 400,
            error: "Invalid token,try again!"
        }

        const admin = await Admin.findById(verificationToken._userId);
        if (!admin) return {
            isError: true,
            statusCode: 404,
            error: "User not found!"
        };

        const salt = await bcrypt.genSalt(slatRounds);
        const adminJwt = admin.generateAuthToken();
        const eAdminJwt = await bcrypt.hash(adminJwt, salt);

        admin.tokens.push(eAdminJwt);

        admin.actionHistorys.push({
            action: "VERIFIY TOTP TOKEN",
            actionResult: "SUCCEESED",
            tokenAndDeviceId: admin._id,
            itemId: admin._id,
        });

        await admin.save();

        return {
            isError: false,
            admin: _.pick(admin, ["firstName", "lastName", "email", "mobileNumber",
                "country"
            ]),
            jwt: adminJwt
        }
    }

    async invalidateToken(adminId, jti) {
        try {
            const admin = await Admin.findById(adminId);
            if (!admin) return {
                isError: true,
                statusCode: 404,
                error: "Admin Not Found"
            }

            await Admin.updateOne({ _id: adminId },
                { $pull: { 'tokensAndDevices': { 'jti': jti } } }
            );

            return {
                isError: false,
                message: 'Logged Out Successfully',
                statusCode: 200
            }
        } catch (error) {
            return {
                isError: true,
                error: 'Error Logging Out',
                statusCode: 400
            }
        }
    }

}

module.exports = AdminService;