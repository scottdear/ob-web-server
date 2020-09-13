const mongoose = require('mongoose');
const { UserService } = require('../services/user');
const { User } = require('../models/users/user');
const { SeaPod } = require('../models/seapod/seapod');
const { RequestAccess } = require('../models/accessRequest');
const { Permission } = require('../models/permission/permission');
const { isOwnerAtSeaPod } = require('../helpers/utilites');

class AccessManagement {

    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }

    async requestAccessNewUser(obj) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const userService = new UserService();
            const {
                user,
                jt
            } = await userService.createUser(obj.user);
            await user.save();
            obj.jt = jt;

            const seaPod = await SeaPod.findOne({
                vessleCode: obj.request.vessleCode
            });

            if (!seaPod) {
                await session.abortTransaction();
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'SeaPod Not found!'
                };
            }
            await session.commitTransaction();
            return await this.requestAccess(user, seaPod, obj.request);
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

    areEqual(reqBody, accessRequest) {
        return reqBody.type == accessRequest.type &&
            reqBody.period == accessRequest.period &&
            reqBody.checkIn == accessRequest.checkIn;
    }

    async requestAccessExistenceUser(obj) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const accessRequest = await RequestAccess.findOne({
                'user._id': obj.user._id,
                'seaPod.vessleCode': obj.body.vessleCode,
                'status': 'PENDING'
            });

            if (accessRequest) {
                const reqBody = obj.body;
                if (this.areEqual(reqBody, accessRequest)) {

                    return {
                        isError: false,
                        request: accessRequest
                    }
                } else {
                    if (accessRequest.status !== 'PENDING') {

                        return {
                            isError: true,
                            statusCode: 403,
                            error: 'You are not allowed to update this request at the current time'
                        };
                    }

                    // const reqBody = obj.body;
                    accessRequest.type = reqBody.type;
                    accessRequest.period = reqBody.period;
                    accessRequest.checkIn = reqBody.checkIn;

                    await accessRequest.save();
                    const seaPod = await SeaPod.findById(accessRequest.seaPod._id);

                    const notificationData = {
                        title: `${accessRequest.user.name} updated his access request to your SeaPod ${accessRequest.seaPod.name} (${accessRequest.seaPod.vessleCode}) for ${this.formatePeriodTime(accessRequest.period)} starting on ${this.formateCheckInDate(accessRequest.checkIn)}`,
                        message: 'SEAPOD ACCESS REQUEST UPDATE',
                        data: accessRequest.toJSON(),
                        type: 'access_request_update'
                    };

                    this.eventEmitter.emit('sendRequestAccessNotification',
                        this.getNotificationTokens(seaPod.users), notificationData);

                    this.eventEmitter.emit('addNotificationDataToOnwers', this.getOwnerIds(seaPod.users),
                        notificationData);
                    await session.commitTransaction();
                    return {
                        isError: false,
                        request: accessRequest
                    }
                }
            } else {
                const user = await User.findById(obj.user._id);
                if (!user) {
                    await session.abortTransaction();
                    return {
                        isError: true,
                        statusCode: 404,
                        error: 'User Not found!'
                    };
                }

                const seaPod = await SeaPod.findOne({
                    vessleCode: obj.body.vessleCode
                });

                if (!seaPod) {
                    await session.abortTransaction();
                    return {
                        isError: true,
                        statusCode: 404,
                        error: 'SeaPod Not found!'
                    };
                }
                await session.commitTransaction();
                return await this.requestAccess(user, seaPod, obj.body);
            }
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
    createAcessRequest(user, seaPod, request) {
        return new RequestAccess({
            user: {
                _id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                imageUrl: user.profileImageUrl,
                email: user.email,
                mobileNumber: user.mobileNumber
            },
            seaPod: {
                _id: seaPod._id,
                name: seaPod.SeaPodName,
                vessleCode: seaPod.vessleCode
            },
            type: request.type,
            period: request.period,
            status: 'PENDING',
            checkIn: request.checkIn,
            isRecieved: false,
            senderId: user._id,
        });
    }
    async requestAccess(user, seaPod, request) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const accessRequest = this.createAcessRequest(user, seaPod, request);
            user.accessRequests.push(accessRequest._id);
            seaPod.accessRequests.push(accessRequest._id);

            await accessRequest.save();
            await user.save();
            await seaPod.save();

            accessRequest.period = this.formatePeriodTime(accessRequest.period);
            accessRequest.checkIn = this.formateCheckInDate(accessRequest.checkIn);

            const notificationData = {
                title: `${accessRequest.user.name} has requested access to your SeaPod ${accessRequest.seaPod.name} (${accessRequest.seaPod.vessleCode}) for ${this.formatePeriodTime(accessRequest.period)} starting on ${this.formateCheckInDate(accessRequest.checkIn)}`,
                message: 'SEAPOD ACCESS REQUEST',
                data: accessRequest.toJSON(),
                type: 'access_request'
            };

            this.eventEmitter.emit('sendRequestAccessNotification',
                this.getNotificationTokens(seaPod.users), notificationData);

            this.eventEmitter.emit('addNotificationDataToOnwers', this.getOwnerIds(seaPod.users),
                notificationData);

            await session.commitTransaction();
            return {
                isError: false,
                request: accessRequest
            }
        } catch (error) {
            await session.abortTransaction();
            return {
                isError: true,
                statusCode: 500,
                error: error.toString()
            };
        } finally {
            session.endSession();
        }
    }
    accessRequestToJson(accessRequest) {
        accessRequest.user = accessRequest.user.toJSON();
        accessRequest.seaPod = accessRequest.seaPod.toJSON();
        return accessRequest.toJSON();
    }
    formatePeriodTime(period) {
        if (period == 0)
            return 'PERMANENT ACCESS';

        const days = period / 86400000;

        if (days < 30 && days != 1)
            return `${days} DAYS`
        else if (days < 30 && days == 1)
            return `${days} DAY`
        else if (days == 30)
            return '1 MONTH';
        else if (days > 30 && days < 365)
            return `${days / 30} MONTHS`;
        else if (days == 365)
            return '1 YEAR';
        else if (days > 365)
            return `${days / 365} YEARS`;

    }
    formateCheckInDate(checkIn) {
        const date = new Date(checkIn);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getNotificationTokens(seaPodUsers) {
        const notificationTokens = [];
        for (const spu of seaPodUsers) {
            if (spu.type === 'OWNER')
                notificationTokens.push(spu.notificationToken);
        }
        // console.log(notificationTokens);
        return notificationTokens;
    }

    getOwnerIds(seaPodUsers) {
        const userIds = [];
        for (const spu of seaPodUsers) {
            if (spu.type === 'OWNER')
                userIds.push(spu._id);
        }
        return userIds;
    }

    async cancelAccessRequest(accessRequestId, userId) {
        const accessRequest = await RequestAccess.findById(accessRequestId);
        if (!accessRequest) return {
            isError: true,
            statusCode: 404,
            error: "Request not found!"
        };

        if (userId != accessRequest.user._id) return {
            isError: true,
            statusCode: 401,
            error: "You are not allowed to update this request status"
        };

        accessRequest.status = 'CANCELED';
        await accessRequest.save();
        const seapodUsers = await SeaPod.findById(accessRequest.seaPod._id).select('users');

        const notificationData = {
            title: `${accessRequest.user.name} canceled his access request to your SeaPod ${accessRequest.seaPod.name} (${accessRequest.seaPod.vessleCode}) for ${this.formatePeriodTime(accessRequest.period)} starting on ${this.formateCheckInDate(accessRequest.checkIn)}`,
            message: 'SEAPOD ACCESS REQUEST UPDATE',
            data: accessRequest.toJSON(),
            type: 'access_request_cancelation'
        };

        this.eventEmitter.emit('sendRequestAccessNotification',
            this.getNotificationTokens(seapodUsers.users), notificationData);

        this.eventEmitter.emit('addNotificationDataToOnwers', this.getOwnerIds(seapodUsers.users),
            notificationData);

        return {
            isError: false,
            accessRequest: accessRequest.toJSON()
        };
    }

    async rejectAccessRequest(accessRequestId, userId) {
        const accessRequest = await RequestAccess.findById(accessRequestId);
        if (!accessRequest) return {
            isError: true,
            statusCode: 404,
            error: "Request not found!"
        };

        const seapod = await SeaPod.findById(accessRequest.seaPod._id).select('users');
        let isOwner = isOwnerAtSeaPod(seapod.users, userId);
        if (!isOwner) return {
            isError: true,
            statusCode: 403,
            error: "Your are not allowed to take this action on the current seapod"
        };


        accessRequest.status = 'REJECTED';
        await accessRequest.save();

        const notificationData = {
            title: `Your Request to access ${accessRequest.seaPod.name}(${accessRequest.seaPod.vessleCode}) has been REJECTED`,
            message: `SEAPOD ACCESS REQUEST REJECTED`,
            data: accessRequest.toJSON(),
            type: 'access_request_rejection'
        };

        const user = await User.findById(accessRequest.user._id).select('tokensAndDevices');
        const userNotificationToken = user.tokensAndDevices[user.tokensAndDevices.length - 1].notificationToken;

        this.eventEmitter.emit('sendRequestAccessNotification',
            [userNotificationToken], notificationData);

        this.eventEmitter.emit('addNotificationDataToOnwers', [accessRequest.user._id],
            notificationData);

        return {
            isError: false,
            accessRequest: accessRequest.toJSON()
        };
    }

    async addMembers(body, senderId, seaPodId) {
        const acinv = await RequestAccess.findOne({
            'user.email': body.email,
            'seaPod._id': seaPodId,
            'status': 'PENDING'
        });

        if (acinv) return {
            isError: true,
            statusCode: 400,
            error: "This user have an already invitation to access your Sea Pod"
        };

        const seapod = await SeaPod.findById(seaPodId);

        if (!seapod) return {
            isError: true,
            statusCode: 404,
            error: "SeaPod Not Found!"
        };

        if (!isOwnerAtSeaPod(seapod.users, senderId)) return {
            isError: true,
            statusCode: 401,
            error: "Access denied. You are not allowed to do this operation"
        };

        const user = await User.findOne({
            "email": body.email
        });
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: "User Not Found!"
        };

        const permission = Permission.findById(body.permissionSetId);
        if (!permission) return {
            isError: true,
            statusCode: 404,
            error: "Permission Not Found!"
        };

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const accessInvitation = new RequestAccess({
                user: {
                    _id: user._id,
                    name: `${user.firstName} ${user.lastName}`,
                    imageUrl: user.profileImageUrl,
                    email: user.email,
                    mobileNumber: user.mobileNumber
                },
                seaPod: {
                    _id: seapod._id,
                    name: seapod.SeaPodName,
                    vessleCode: seapod.vessleCode
                },
                type: "MEMBER",
                period: 0,
                status: 'PENDING',
                checkIn: Date.now(),
                isRecieved: true,
                senderId: senderId,
                recieverId: user._id,
                permissionSetId: body.permissionSetId
            });

            user.accessInvitation.push(accessInvitation._id);
            seapod.accessInvitation.push(accessInvitation._id);

            const notificationData = {
                title: `You are invited to join a sea pod (${accessInvitation.seaPod.name}) as a Member`,
                message: 'SEAPOD ACCESS INVITATION',
                data: accessInvitation.toJSON(),
                type: 'access_invitation'
            };
            user.notifications.push(notificationData);

            await accessInvitation.save();
            await user.save();
            await seapod.save();
            await session.commitTransaction();
            this.eventEmitter.emit('sendRequestAccessNotification',
                [user.tokensAndDevices[user.tokensAndDevices.length - 1].notificationToken], notificationData);

            return {
                isError: false,
                invitation: accessInvitation
            }
        } catch (error) {
            // console.log(error);
            await session.abortTransaction();
            return {
                isError: true,
                statusCode: 500,
                error: error.toString()
            };
        } finally {
            session.endSession();
        }
    }

    async acceptAccessRequest(accessRequestId, acceptedBody, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            acceptedBody.status = 'ACCEPTED';
            const accessRequest = await RequestAccess.findOneAndUpdate({
                _id: accessRequestId
            }, acceptedBody, {
                new: true
            });

            if (!accessRequest) return {
                isError: true,
                statusCode: 404,
                error: "Request not found!"
            };

            const seapod = await SeaPod.findById(accessRequest.seaPod._id).select('users');
            let isOwner = isOwnerAtSeaPod(seapod.users, userId);
            if (!isOwner) {
                await session.abortTransaction();
                return {
                    isError: true,
                    statusCode: 403,
                    error: "Your are not allowed to take this action on the current seapod"
                };
            }

            const permission = Permission.findById(acceptedBody.permissionSetId);
            if (!permission) return {
                isError: true,
                statusCode: 404,
                error: "Permission Not Found!"
            };

            const user = await User.findOneAndUpdate({
                _id: accessRequest.user._id
            }, {
                $push: {
                    'seaPods': accessRequest.seaPod._id
                }
            }, {
                new: true
            });

            const userNotificationToken = user.tokensAndDevices[user.tokensAndDevices.length - 1].notificationToken;
            const sp = await SeaPod.findById(accessRequest.seaPod._id).populate('permissionSets');

            sp.users.push({
                _id: user._id,
                userName: user.getUserName(),
                profilePicUrl: user.profileImageUrl,
                notificationToken: userNotificationToken,
                type: accessRequest.type,
                permissionSet: acceptedBody.permissionSetId,
                accessPeriod: accessRequest.period,
            });

            await sp.save();
            await session.commitTransaction();

            const notificationData = {
                title: `Your Request to access ${accessRequest.seaPod.name}(${accessRequest.seaPod.vessleCode}) has been ACEPTED`,
                message: `SEAPOD ACCESS REQUEST UPDATE`,
                data: accessRequest.toJSON(),
                type: 'access_request_approval'
            };

            this.eventEmitter.emit('sendRequestAccessNotification',
                [userNotificationToken], notificationData);

            this.eventEmitter.emit('addNotificationDataToOnwers', [accessRequest.user._id],
                notificationData);

            return {
                isError: false,
                accessRequest: accessRequest.toJSON()
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

    async acceptAccessInvitation(accessInvitationId, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const acceptedInvitation = await RequestAccess.findOne({ _id: accessInvitationId, status: 'ACCEPTED' });
            if (acceptedInvitation) return {
                isError: true,
                statusCode: 403,
                error: "Invitation aready accepted!"
            };

            const accessInvitation = await RequestAccess.findOneAndUpdate({
                _id: accessInvitationId
            }, {
                status: 'ACCEPTED'
            }, {
                new: true
            });

            if (!accessInvitation) return {
                isError: true,
                statusCode: 404,
                error: "Invitation not found!"
            };

            if (accessInvitation.user._id != userId) {
                await session.abortTransaction();
                return {
                    isError: true,
                    statusCode: 401,
                    error: "Access denied. You are not allowed to accept this invitation"
                }
            }

            const user = await User.findOneAndUpdate({
                _id: accessInvitation.user._id
            }, {
                $push: {
                    'seaPods': accessInvitation.seaPod._id
                }
            }, {
                new: true
            });

            const userNotificationToken = user.tokensAndDevices[user.tokensAndDevices.length - 1].notificationToken;
            const seapod = await SeaPod.findById(accessInvitation.seaPod._id).populate('permissionSets');

            seapod.users.push({
                _id: user._id,
                userName: user.getUserName(),
                profilePicUrl: user.profileImageUrl,
                permissionSet: accessInvitation.permissionSetId,
                notificationToken: userNotificationToken,
                type: accessInvitation.type,
                accessPeriod: accessInvitation.period,
            });

            await seapod.save();
            await session.commitTransaction();

            const notificationData = {
                title: `${accessInvitation.user.name} is now a member at ${accessInvitation.seaPod.name}(${accessInvitation.seaPod.vessleCode}) Sea Pod`,
                message: `SEAPOD INVITATION ACCEPT`,
                data: accessInvitation.toJSON(),
                type: 'access_invitation_approval'
            };
            this.eventEmitter.emit('sendRequestAccessNotification',
                this.getNotificationTokens(seapod.users), notificationData);

            this.eventEmitter.emit('addNotificationDataToOnwers', this.getOwnerIds(seapod.users),
                notificationData);

            return {
                isError: false,
                accessRequest: accessInvitation.toJSON()
            };
        } catch (error) {
            // console.log(error);
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

    async rejectAccessInvitation(accessInvitationId, userId) {
        const accessInvitation = await RequestAccess.findById(
            accessInvitationId
        );
        if (!accessInvitation) return {
            isError: true,
            statusCode: 404,
            error: "Invitation not found!"
        };

        if (accessInvitation.user._id != userId)
            return {
                isError: true,
                statusCode: 401,
                error: "Access denied. You are not allowed to reject this invitation"
            }

        accessInvitation.status = 'REJECTED';
        await accessInvitation.save();

        const notificationData = {
            title: `${accessInvitation.user.name} refused your invitation to access ${accessInvitation.seaPod.name}(${accessInvitation.seaPod.vessleCode}) Sea Pod`,
            message: `SEAPOD ACCESS INVITATION UPDATE`,
            data: accessInvitation.toJSON(),
            type: 'access_invitation_rejection'
        };

        const seapod = await SeaPod.findById(accessInvitation.seaPod._id);
        if (!seapod)
            return {
                isError: true,
                statusCode: 404,
                error: "SeaPod Not found!"
            };

        this.eventEmitter.emit('sendRequestAccessNotification',
            this.getNotificationTokens(seapod.users), notificationData);

        this.eventEmitter.emit('addNotificationDataToOnwers', this.getOwnerIds(seapod.users),
            notificationData);

        return {
            isError: false,
            accessRequest: accessInvitation.toJSON()
        };
    }

    async cancelAccessInvitation(accessInvitationId, userId) {
        const accessInvitation = await RequestAccess.findById(accessInvitationId);
        if (!accessInvitation) return {
            isError: true,
            statusCode: 404,
            error: "Invitation not found!"
        };

        const seapod = await SeaPod.findById(accessInvitation.seaPod._id).select('users');

        if (!isOwnerAtSeaPod(seapod.users, userId)) return {
            isError: true,
            statusCode: 401,
            error: "Access Denied. You are not allowed to cancel this invitation"
        };

        accessInvitation.status = 'CANCELED';
        await accessInvitation.save();


        const notificationData = {
            title: `Your Invitation to ${accessInvitation.seaPod.name} (${accessInvitation.seaPod.vessleCode}) has been canceled by the owner`,
            message: 'SEAPOD ACCESS INVITATION UPDATE',
            data: accessInvitation.toJSON(),
            type: 'access_invitaion_cancelation'
        };
        const user = await User.findById(accessInvitation.user._id).select('tokensAndDevices');
        this.eventEmitter.emit('sendRequestAccessNotification',
            [user.tokensAndDevices[user.tokensAndDevices.length - 1].notificationToken], notificationData);

        this.eventEmitter.emit('addNotificationDataToOnwers', [accessInvitation.user._id],
            notificationData);

        return {
            isError: false,
            accessRequest: accessInvitation.toJSON()
        };
    }

    async getAccessRequestById(accessRequestId) {
        const accessRequest = await RequestAccess.findById(accessRequestId);
        if (!accessRequest) return {
            isError: true,
            statusCode: 404,
            error: "Request Not found!"
        };

        return {
            isError: false,
            request: accessRequest
        }
    }

    async getAccessbyUser(userId) {
        const user = await User.findById(userId).populate('seaPods');
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: "User Not found!"
        };

        let sentInvitations = [], sentRequests = [];
        const sentAccess = await RequestAccess.find({ senderId: userId });
        sentAccess.forEach(async access => {
            access.isRecieved == true ? sentInvitations.push(access) : sentRequests.push(access)
        });

        const receivedInvitations = await RequestAccess.find({ recieverId: userId });

        let allAccessRequests = [];
        user.seaPods.forEach(seapod => {
            const ownerIds = this.getOwnerIds(seapod.users);
            ownerIds.forEach(id => {
                if (id == userId) allAccessRequests = allAccessRequests.concat(seapod.accessRequests)
            })
        })
        const receivedRequests = await RequestAccess.find({ '_id': { $in: allAccessRequests } })

        return {
            isError: false,
            access: {
                sentInvitations,
                receivedInvitations,
                sentRequests,
                receivedRequests
            }
        }
    }

}

module.exports = AccessManagement;