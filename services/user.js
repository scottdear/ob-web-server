const bcrypt = require('bcrypt');
const config=require('config');
const { v4: uuidv4 } = require('uuid');

const { User, validatePassword } = require('../models/users/user');
const { filterUserTokensAndDevices } = require('../helpers/filtering');
const { MailService } = require('./mail');

const slatRounds = parseInt(config.get("userSalt"));

class UserService {
    async createUser(obj) {
        const user = new User(obj.userData);

        const salt = await bcrypt.genSalt(slatRounds);
        user.password = await bcrypt.hash(user.password, salt);

        const jti = uuidv4();
        let userJwt = user.generateAuthToken(jti);
        let jt = userJwt;

        user.tokensAndDevices.push({
            jti: jti,
            notificationToken: obj.notificationToken,
            hardwareId: obj.hardwareId,
            model: obj.model,
        });

        user.actionHistorys.push({
            action: "Account Registration",
            actionResult: "SUCCEESED",
            tokenAndDeviceId: user.tokensAndDevices[0]._id,
            itemId: user._id,
        });

        user.notificationSettings.push({
            name: 'ACCESS REQUEST RECEIVEDE',
            phone: 'ON',
            mail: 'ON'
        }, {
            name: 'ACCESS REQUEST APPROVED OR REJECTED',
            phone: 'ON',
            mail: 'OFF'
        }, {
            name: 'INVITATION RECEIVED',
            phone: 'ON',
            mail: 'ON'
        }, {
            name: 'INVITATION ACCEPTED OR REJECTED',
            phone: 'OFF',
            mail: 'OFF'
        }, {
            name: 'URGENT NOTIFICATIONS',
            phone: 'URGENT',
            mail: 'URGENT'
        });

        return {
            user: user,
            jt: jt
        };
    }

    async updatePassword(obj) {
        let user = await User.findById(obj.userId);

        if (!user) return {
            isError: true,
            statusCode: 404,
            error: 'User not found!'
        };

        const isValidPassword = await bcrypt.compare(obj.currentPassword, user.password);

        if (!isValidPassword) return {
            isError: true,
            statusCode: 400,
            error: 'Invalid password'
        };

        const salt = await bcrypt.genSalt(slatRounds);
        const newPassword = await bcrypt.hash(obj.newPassword, salt);

        const isUsedPreviously = await this.isPasswordUserPreviously(obj.newPassword, user.previousPasswords);
        if (isUsedPreviously) {
            return {
                isError: true,
                statusCode: 400,
                error: "You Shouldn't use previously used passwords!"
            };
        }

        user.previousPasswords.push(user.password);
        user.password = newPassword;

        const jti = uuidv4();
        let userJwt = user.generateAuthToken(jti);

        user.tokensAndDevices.push({
            jti: jti,
            notificationToken: obj.notificationToken,
            hardwareId: obj.hardwareId,
            model: obj.model
        })

        await user.save();

        return {
            isError: false,
            jwtoken: userJwt,
        }
    }

    async isPasswordUserPreviously(password, previousPasswords) {
        for (const pass of previousPasswords) {
            const res = await bcrypt.compare(password, pass);
            if (res) return res;
        }
        return false;
    }

    async forgetPassword(obj) {
        let user = await User.findOne({ email: obj.email });
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: 'User not found!'
        };

        const token = user.generatePasswordToken();

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + (3600000 * 12); //12 hour
        await user.save();

        const url = `http://${obj.host}/v1/api/users/reset/${token}`;
        const mailService = new MailService();
        await mailService.sendForgetPasswordMail(obj.email, url);

        return {
            isError: false
        }
    }

    async resetPasswordWithToken(token) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        })

        if (!user) return {
            isError: true,
            statusCode: 401,
            error: 'Password reset token is invalid or has expired!'
        };

        return {
            isError: false
        }
    }

    async newPasswordWithToken(obj) {
        const user = await User.findOne({
            resetPasswordToken: obj.token,
            resetPasswordExpires: { $gt: Date.now() }
        })

        if (!user) return {
            isError: true,
            statusCode: 401,
            error: 'Password reset token is invalid or has expired!'
        };

        const newPassword = obj.body.password;
        const confirmPassword = obj.body.confirm_password;
        if (newPassword != confirmPassword) return {
            isError: true,
            statusCode: 400,
            error: 'New Password and Confirmed Password do not match!'
        };

        const passwordValidationResult = validatePassword(obj.body);
        if (passwordValidationResult.error) return {
            isError: true,
            statusCode: 400,
            'message': passwordValidationResult.error.message
        };

        const salt = await bcrypt.genSalt(slatRounds);
        const password = await bcrypt.hash(newPassword, salt);

        const isUsedPreviously = await this.isPasswordUserPreviously(newPassword, user.previousPasswords);
        if (isUsedPreviously) return {
            isError: true,
            statusCode: 400,
            error: "You Shouldn't use previously used passwords!"
        };

        user.previousPasswords.push(user.password);
        user.password = password;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.tokensAndDevices = [];

        await user.save();

        return {
            isError: false,
        }
    }

    async updateProfile(obj) {
        const user = await User.updateOne({
            _id: obj.userId
        }, obj.body);
        if (!user) return {
            isError: true,
            statusCode: 500,
            error: 'Failed to update user data please try again later!'
        };

        //TODO: enhance update user data
        return {
            isError: false,
            statusCode: 200,
            user: obj.body
        };
    }

    async getAllUsers() {
        const users = await User.find().select('-password -previousPasswords');
        return filterUserTokensAndDevices(users);
    }

    async getuserNotifications(userId) {
        const userNotifications = await User.findById(userId).select('notifications');
        if (!userNotifications) return {
            isError: true,
            statusCode: 404,
            error: 'User Not Found!'
        }

        return {
            isError: false,
            notifications: userNotifications.notifications.reverse()
        };
    }

    async addEmergencyContatact(userId, emegencyContact) {
        const user = await User.findById(userId);
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: 'User Not Found!'
        }

        user.emergencyContacts.push(emegencyContact);
        await user.save();
        return {
            isError: false,
            emergencyContacts: user.emergencyContacts
        }
    }

    async updateUserEmergencyContact(userId, emergencyContatactId, updatedEmergencyContact) {
        try {
            const user = await User.findOneAndUpdate({
                "_id": userId,
                "emergencyContacts._id": emergencyContatactId
            }, {
                "$set": {
                    "emergencyContacts.$": updatedEmergencyContact
                }
            }, {
                new: true
            });

            if (!user) return {
                isError: true,
                statusCode: 404,
                error: 'User Not Found!'
            }
            // console.log(user);
            return {
                isError: false,
                emergencyContacts: user.emergencyContacts
            }
        } catch (error) {
            return {
                isError: true,
                error: error.message,
                statusCode: 500
            }
        }
    }

    async deleteUserEmergencyContact(userId, emergencyContatactId) {
        try {
            const user = await User.findById(userId);
            if (!user) return {
                isError: true,
                statusCode: 404,
                error: 'User Not Found!'
            }

            if (user.emergencyContacts.length == 1) return {
                isError: true,
                statusCode: 400,
                error: 'Your are not allowed to remove all emergency contacts'
            }

            user.emergencyContacts.pull({
                _id: emergencyContatactId
            });
            await user.save();

            return {
                isError: false,
                emergencyContacts: user.emergencyContacts
            }
        } catch (error) {
            console.log(error);
        }
    }

    indexOf(emergencyContacts, emegencyContactId) {
        let index = 0;
        for (const emergencyContact of emergencyContacts) {
            if (emergencyContact._id === emegencyContactId)
                return index;
            index++;
        }

        return index;
    }

    async isExist(emailAddress) {
        return await User.exists({
            email: emailAddress
        });
    }

    async invalidateToken(userId, jti) {
        try {
            const user = await User.findById(userId);
            if (!user) return {
                isError: true,
                statusCode: 404,
                error: "User Not Found"
            }

            await User.updateOne({ _id: userId },
                { $pull: { 'tokensAndDevices': { 'jti': jti } } }
            );

            return {
                isError: false,
                message: 'logged out successfully',
                statusCode: 200
            }
        } catch (error) {
            return {
                isError: true,
                error: 'error logging out',
                statusCode: 400
            }
        }
    }

    async invalidateAllToken(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) return {
                isError: true,
                statusCode: 404,
                error: "User Not Found"
            }

            await User.updateOne({ _id: userId },
                { $set: { 'tokensAndDevices': [] } },
                { safe: true, multi: true }
            );

            return {
                isError: false,
                message: 'logged out successfully',
                statusCode: 200
            }
        } catch (error) {
            return {
                isError: true,
                error: 'error logging out',
                statusCode: 400
            }
        }
    }
}

async function addNotificationDataToUser(userIds, notificationData) {
    await User.updateMany({
        _id: {
            $in: userIds
        }
    }, {
        $push: {
            'notifications': notificationData
        }
    })
}

exports.UserService = UserService;
exports.addNotificationDataToUser = addNotificationDataToUser;