const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const { SeaPodService } = require('./seapod');
const { UserService } = require('./user');
const { MailService } = require('./mail')
const { generateFakeData } = require('../helpers/utilites');
const { filterUserAndSeapod, filterUser, filterUserAndSeapods } = require('../helpers/filtering');

const { User } = require('../models/users/user');
const { VerificationToken } = require('../models/users/verificationToken');
const { SeaPod } = require('../models/seapod/seapod');
const { RequestAccess } = require('../models/accessRequest');
const { Permission } = require('../models/permission/permission');
const { LightiningScene } = require('../models/lightiningScene/lightiningScene');

const data = require('./demo');

class AuthService {

    async SignUpWithSeaPodCreation(obj) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const userService = new UserService();
            const creatUserResult = await userService.createUser(obj.user);
            let user = creatUserResult.user;
            // let jt = creatUserResult.jt;

            const seapodService = new SeaPodService();
            let seapod = await seapodService.createSeapod(obj.seapod, obj.user.notificationToken, obj.host, user);

            user.seaPods.push(seapod._id);

            await user.save();
            await seapod.save();

            user = filterUserAndSeapod(user.toJSON(), seapod.toJSON(), seapod.data);

            const token = new VerificationToken({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
            await token.save();

            const webUrl = `http://${obj.host}/v1/api/auth/confirmation/${token.token}`;
            const appUrl = `http://${obj.host}/v1/api/auth/deeplink/${token.token}`;
            const mailService = new MailService();
            await mailService.sendConfirmationMail(obj.user.userData.email, obj.user.userData.firstName, webUrl, appUrl);

            await session.commitTransaction();

            return {
                isError: false,
                message: `An email has been sent to ${obj.user.userData.email} with further instructions`
            }

        } catch (error) {
            await session.abortTransaction();
            return {
                isError: true,
                error: error
            }
        } finally {
            session.endSession();
        }
    }

    async login(obj) {
        let user = await User.findOne({ email: obj.email })
            .populate('seaPods')
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'accessRequests',
                    model: 'ReqestAccess'
                }
            })
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'accessInvitation',
                    model: 'ReqestAccess'
                }
            })
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'permissionSets',
                    model: 'Permissions'
                }
            })
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'lightScenes',
                    model: 'LightiningScenes'
                }
            })
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'users.lighting.lightScenes',
                    model: 'LightiningScenes'
                }
            })
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'users.permissionSet',
                    model: 'Permissions'
                }
            })
            .populate('accessRequests')
            .populate('accessInvitation');

        if (!user) return {
            isError: true,
            statusCode: 400,
            error: 'Your email and password combination was incorrect. Please try again.'
        };

        const isValidPassword = await bcrypt.compare(obj.password, user.password);

        if (!isValidPassword) return {
            isError: true,
            statusCode: 400,
            error: 'Your email and password combination was incorrect. Please try again.'
        };

        if (!user.isVerified) return {
            isError: true,
            statusCode: 401,
            error: 'Your account has not been verified.'
        };

        const jti = uuidv4();
        const token = user.generateAuthToken(jti);

        let tokenAndDeviceId = this.logReturnTokenAndDeviceId(obj, jti, user.tokensAndDevices);

        user.actionHistorys.push({
            action: "LOGIN",
            actionResult: "SUCCEESED",
            tokenAndDeviceId: tokenAndDeviceId,
            itemId: user._id,
        });

        user = await user.save();

        if (user.seaPods.length === 0) {
            return {
                isError: false,
                user: filterUser(user.toJSON()),
                jwtoken: token
            };
        }
        user.notifications.reverse();
        user = filterUserAndSeapods(user.toJSON(),
            generateFakeData(user.seaPods.length));
        return {
            isError: false,
            user: user,
            jwtoken: token
        };
    }

    logReturnTokenAndDeviceId(obj, jti, tokensAndDevices) {
        const hardwareId = obj.hardwareId;
        let tokenAndDeviceIndex = this.getTokenAndDeviceIndex(tokensAndDevices, hardwareId);
        if (tokenAndDeviceIndex === -1) {
            tokensAndDevices.push({
                jti: jti,
                notificationToken: obj.notificationToken,
                hardwareId: hardwareId,
                model: obj.model
            });
            return tokensAndDevices[tokensAndDevices.length - 1]._id;
        } else {
            const tokenAndDeviceId = tokensAndDevices[tokenAndDeviceIndex]._id;
            tokensAndDevices[tokenAndDeviceIndex] = {
                _id: tokenAndDeviceId,
                jti: jti,
                notificationToken: obj.notificationToken,
                hardwareId: hardwareId,
                model: obj.model
            };
            return tokenAndDeviceId;
        }
    }

    getTokenAndDeviceIndex(tokensAndDevices, hardwareId) {
        for (let index = 0; index < tokensAndDevices.length; index++)
            if (tokensAndDevices[index].hardwareId == hardwareId)
                return index;

        return -1;
    }

    async autoLogin(userId) {
        let user = await User.findById(userId)
            .populate('seaPods')
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'accessRequests',
                    model: 'ReqestAccess'
                }
            })
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'accessInvitation',
                    model: 'ReqestAccess'
                }
            })
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'permissionSets',
                    model: 'Permissions'
                }
            })
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'lightScenes',
                    model: 'LightiningScenes'
                }
            })
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'users.lighting.lightScenes',
                    model: 'LightiningScenes'
                }
            })
            .populate({
                path: 'seaPods',
                populate: {
                    path: 'users.permissionSet',
                    model: 'Permissions'
                }
            })
            .populate('accessRequests')
            .populate('accessInvitation');

        if (!user) {
            return {
                isError: true,
                statusCode: 404,
                error: 'User Not found!'
            }
        }

        if (!user.isVerified) return {
            isError: true,
            statusCode: 401,
            error: 'Your account has not been verified.'
        };

        user.notifications.reverse();
        user = filterUserAndSeapods(user.toJSON(),
            generateFakeData(user.seaPods.length));

        return {
            isError: false,
            user: user,
        };
    }

    async demo(req) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            data.users.forEach(async userData => {
                const existed = await User.findById(userData._id);
                if (!existed) {
                    let obj = new User(userData)
                    await obj.save();
                }
            });

            data.seapods.forEach(async seapod => {
                const existed = await SeaPod.findById(seapod._id);
                if (!existed) {
                    let obj = new SeaPod(seapod)
                    await obj.save();
                }
            });

            data.requests.forEach(async request => {
                const existed = await RequestAccess.findById(request._id);
                if (!existed) {
                    let obj = new RequestAccess(request)
                    await obj.save();
                }
            });

            data.permissionSets.forEach(async permission => {
                const existed = await Permission.findById(permission._id);
                if (!existed) {
                    let obj = new Permission(permission)
                    await obj.save();
                }
            });

            data.lightScenes.forEach(async lightScene => {
                const existed = await LightiningScene.findById(lightScene._id);
                if (!existed) {
                    let obj = new LightiningScene(lightScene)
                    await obj.save();
                }
            });

            await session.commitTransaction();

            //TO-DO: create function to return populated user for login, autoLogin and Demo
            let user = await User.findOne({ email: 'JohnDoe21@gmail.com' })
                .populate('seaPods')
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'accessRequests',
                        model: 'ReqestAccess'
                    }
                })
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'accessInvitation',
                        model: 'ReqestAccess'
                    }
                })
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'permissionSets',
                        model: 'Permissions'
                    }
                })
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'lightScenes',
                        model: 'LightiningScenes'
                    }
                })
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'users.lighting.lightScenes',
                        model: 'LightiningScenes'
                    }
                })
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'users.permissionSet',
                        model: 'Permissions'
                    }
                })
                .populate('accessRequests')
                .populate('accessInvitation');

            if (!user) return {
                isError: true,
                statusCode: 400,
                error: 'Your email and password combination was incorrect. Please try again.'
            };

            if (!user.isVerified) return {
                isError: true,
                statusCode: 401,
                error: 'Your account has not been verified.'
            };

            const jti = uuidv4();
            const token = user.generateAuthToken(jti);

            let tokenAndDeviceId = this.logReturnTokenAndDeviceId(req, jti, user.tokensAndDevices);

            user.actionHistorys.push({
                action: "LOGIN",
                actionResult: "SUCCEESED",
                tokenAndDeviceId: tokenAndDeviceId,
                itemId: user._id,
            });

            user = await user.save();
            user.notifications.reverse();
            user = filterUserAndSeapods(user.toJSON(),
                generateFakeData(user.seaPods.length));
            return {
                isError: false,
                user: user,
                jwtoken: token
            };

        } catch (error) {
            await session.abortTransaction();
            return {
                isError: true,
                statusCode: 500,
                error: error.message
            }
        } finally {
            session.endSession();
        }
    }

    async confirm(token) {
        if (!token || token.length != 32) return {
            isError: true,
            statusCode: 400,
            error: 'invalid token'
        };

        const userToken = await VerificationToken.findOne({
            token: token
        });

        if (!userToken) return {
            isError: true,
            statusCode: 400,
            error: "We were unable to find a valid token. Your token my have expired."
        };

        const user = await User.findById(userToken._userId);
        if (!user) return {
            isError: true,
            statusCode: 400,
            error: "We were unable to find a user for this token."
        };

        if (user.isVerified) return {
            isError: true,
            statusCode: 400,
            error: 'This user has already been verified.'
        }

        try {
            user.isVerified = true;
            await user.save();
            return {
                isError: false,
                message: "The account has been verified. Please log in."
            }
        } catch (error) {
            return {
                isError: true,
                statusCode: 500,
                error
            }
        }
    }

    async resendConfirm(userId, host) {
        try {
            const user = await User.findById(userId);
            if (!user) return {
                isError: true,
                statusCode: 400,
                error: 'User not found.'
            };

            if (user.isVerified) return {
                isError: true,
                statusCode: 400,
                error: 'This account has already been verified. Please log in.'
            };

            const token = new VerificationToken({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
            await token.save();

            const email = user.email; 
            const webUrl = `http://${host}/v1/api/auth/confirmation/${token.token}`;
            const appUrl = `http://${host}/v1/api/auth/deeplink/${token.token}`;
            const mailService = new MailService();
            await mailService.sendConfirmationMail(email, user.firstName, webUrl, appUrl);

            return {
                isError: false,
                message: `An email has been sent to ${email} with further instructions`
            }
        } catch (error) {
            return {
                isError: true,
                error: error
            }
        }
    }

}

exports.AuthService = AuthService;