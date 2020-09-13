const mongoose = require('mongoose');
const { SeaPod } = require('../models/seapod/seapod');
const { Permission } = require('../models/permission/permission');
const { isOwnerAtSeaPod } = require('../helpers/utilites');

class PermissionService {
    async addDefaultPremissionSets(seapod) {
        const guest = new Permission({
            Name: "Default GUEST Permissions",
            Sets: [
                {
                    Name: 'MainControls',
                    Permissions: [
                        { Name: 'changeOrientation', Status: 'OFF' },
                        { Name: 'raiseLowerStairs', Status: 'OFF' },
                        { Name: 'frostWindows', Status: 'ON' },
                        { Name: 'modifyACTemp', Status: 'ON' },
                        { Name: 'doorsControl', Status: 'OFF' },
                        { Name: 'windowsControl', Status: 'ON' },
                        { Name: 'smartWindowsControl', Status: 'ON' },
                        { Name: 'powerSupply', Status: 'EMERGENCY' },
                        { Name: 'waterSupply', Status: 'EMERGENCY' },
                        { Name: 'audioSystem', Status: 'ON' },
                        { Name: 'stove', Status: 'ON' },
                        { Name: 'oven', Status: 'ON' },
                    ]
                },
                {
                    Name: 'Cameras',
                    Permissions: [
                        { Name: 'kitchen', Status: 'EMERGENCY' },
                        { Name: 'livingRoom', Status: 'OFF' },
                        { Name: 'Bedroom', Status: 'EMERGENCY' },
                    ]
                },
                {
                    Name: 'Lighting',
                    Permissions: [
                        { Name: 'turnLights', Status: 'ON' },
                        { Name: 'modifyIntensity', Status: 'ON' },
                        { Name: 'switchLightscene', Status: 'ON' },
                        { Name: 'addPersonalLightscene', Status: 'ON' },
                        { Name: 'addGlobalLightscene', Status: 'OFF' },
                        { Name: 'manageGlobalLightscene', Status: 'OFF' },
                    ]
                },
                {
                    Name: 'AccessManagement',
                    Permissions: [
                        { Name: 'inviteGuests', Status: 'OFF' },
                    ]
                },
                {
                    Name: 'SeapodInfo',
                    Permissions: [
                        { Name: 'serialNumber', Status: 'OFF' },
                        { Name: 'modelInfoAndSpec', Status: 'OFF' },
                    ]
                },
            ],
            isDefault: true
        });
        await guest.save();

        const member = new Permission({
            Name: "Default MEMBER Permissions",
            Sets: [
                {
                    Name: 'MainControls',
                    Permissions: [
                        { Name: 'changeOrientation', Status: 'ON' },
                        { Name: 'raiseLowerStairs', Status: 'ON' },
                        { Name: 'frostWindows', Status: 'ON' },
                        { Name: 'modifyACTemp', Status: 'ON' },
                        { Name: 'doorsControl', Status: 'ON' },
                        { Name: 'windowsControl', Status: 'ON' },
                        { Name: 'smartWindowsControl', Status: 'ON' },
                        { Name: 'powerSupply', Status: 'ON' },
                        { Name: 'waterSupply', Status: 'ON' },
                        { Name: 'audioSystem', Status: 'ON' },
                        { Name: 'stove', Status: 'ON' },
                        { Name: 'oven', Status: 'ON' },
                    ]
                },
                {
                    Name: 'Cameras',
                    Permissions: [
                        { Name: 'kitchen', Status: 'ON' },
                        { Name: 'livingRoom', Status: 'ON' },
                        { Name: 'Bedroom', Status: 'EMERGENCY' },
                    ]
                },
                {
                    Name: 'Lighting',
                    Permissions: [
                        { Name: 'turnLights', Status: 'ON' },
                        { Name: 'modifyIntensity', Status: 'ON' },
                        { Name: 'switchLightscene', Status: 'ON' },
                        { Name: 'addPersonalLightscene', Status: 'ON' },
                        { Name: 'addGlobalLightscene', Status: 'ON' },
                        { Name: 'manageGlobalLightscene', Status: 'ON' },
                    ]
                },
                {
                    Name: 'AccessManagement',
                    Permissions: [
                        { Name: 'inviteGuests', Status: 'OFF' },
                    ]
                },
                {
                    Name: 'SeapodInfo',
                    Permissions: [
                        { Name: 'serialNumber', Status: 'ON' },
                        { Name: 'modelInfoAndSpec', Status: 'ON' },
                    ]
                },
            ],
            isDefault: true
        });
        await member.save();

        const visitor = new Permission({
            Name: "Default VISITOR Permissions",
            Sets: [
                {
                    Name: 'MainControls',
                    Permissions: [
                        { Name: 'changeOrientation', Status: 'OFF' },
                        { Name: 'raiseLowerStairs', Status: 'OFF' },
                        { Name: 'frostWindows', Status: 'ON' },
                        { Name: 'modifyACTemp', Status: 'ON' },
                        { Name: 'doorsControl', Status: 'OFF' },
                        { Name: 'windowsControl', Status: 'ON' },
                        { Name: 'smartWindowsControl', Status: 'ON' },
                        { Name: 'powerSupply', Status: 'OFF' },
                        { Name: 'waterSupply', Status: 'OFF' },
                        { Name: 'audioSystem', Status: 'ON' },
                        { Name: 'stove', Status: 'OFF' },
                        { Name: 'oven', Status: 'OFF' },
                    ]
                },
                {
                    Name: 'Cameras',
                    Permissions: [
                        { Name: 'kitchen', Status: 'EMERGENCY' },
                        { Name: 'livingRoom', Status: 'EMERGENCY' },
                        { Name: 'Bedroom', Status: 'EMERGENCY' },
                    ]
                },
                {
                    Name: 'Lighting',
                    Permissions: [
                        { Name: 'turnLights', Status: 'OFF' },
                        { Name: 'modifyIntensity', Status: 'OFF' },
                        { Name: 'switchLightscene', Status: 'OFF' },
                        { Name: 'addPersonalLightscene', Status: 'OFF' },
                        { Name: 'addGlobalLightscene', Status: 'OFF' },
                        { Name: 'manageGlobalLightscene', Status: 'OFF' },
                    ]
                },
                {
                    Name: 'AccessManagement',
                    Permissions: [
                        { Name: 'inviteGuests', Status: 'OFF' },
                    ]
                },
                {
                    Name: 'SeapodInfo',
                    Permissions: [
                        { Name: 'serialNumber', Status: 'OFF' },
                        { Name: 'modelInfoAndSpec', Status: 'OFF' },
                    ]
                },
            ],
            isDefault: true
        });
        await visitor.save();

        const admin = new Permission({
            Name: "Default ADMIN Permissions",
            Sets: [
                {
                    Name: 'MainControls',
                    Permissions: [
                        { Name: 'changeOrientation', Status: 'EMERGENCY' },
                        { Name: 'raiseLowerStairs', Status: 'EMERGENCY' },
                        { Name: 'frostWindows', Status: 'EMERGENCY' },
                        { Name: 'modifyACTemp', Status: 'EMERGENCY' },
                        { Name: 'doorsControl', Status: 'EMERGENCY' },
                        { Name: 'windowsControl', Status: 'EMERGENCY' },
                        { Name: 'smartWindowsControl', Status: 'EMERGENCY' },
                        { Name: 'powerSupply', Status: 'EMERGENCY' },
                        { Name: 'waterSupply', Status: 'EMERGENCY' },
                        { Name: 'audioSystem', Status: 'EMERGENCY' },
                        { Name: 'stove', Status: 'EMERGENCY' },
                        { Name: 'oven', Status: 'EMERGENCY' },
                    ]
                },
                {
                    Name: 'Cameras',
                    Permissions: [
                        { Name: 'kitchen', Status: 'EMERGENCY' },
                        { Name: 'livingRoom', Status: 'EMERGENCY' },
                        { Name: 'Bedroom', Status: 'EMERGENCY' },
                    ]
                },
                {
                    Name: 'Lighting',
                    Permissions: [
                        { Name: 'turnLights', Status: 'EMERGENCY' },
                        { Name: 'modifyIntensity', Status: 'EMERGENCY' },
                        { Name: 'switchLightscene', Status: 'EMERGENCY' },
                        { Name: 'addPersonalLightscene', Status: 'EMERGENCY' },
                        { Name: 'addGlobalLightscene', Status: 'EMERGENCY' },
                        { Name: 'manageGlobalLightscene', Status: 'EMERGENCY' },
                    ]
                },
                {
                    Name: 'AccessManagement',
                    Permissions: [
                        { Name: 'inviteGuests', Status: 'OFF' },
                    ]
                },
                {
                    Name: 'SeapodInfo',
                    Permissions: [
                        { Name: 'serialNumber', Status: 'ON' },
                        { Name: 'modelInfoAndSpec', Status: 'ON' },
                    ]
                },
            ],
            isDefault: true
        });
        await admin.save();

        const owner = new Permission({
            Name: "Default OWNER Permissions",
            Sets: [
                {
                    Name: 'MainControls',
                    Permissions: [
                        { Name: 'changeOrientation', Status: 'ON' },
                        { Name: 'raiseLowerStairs', Status: 'ON' },
                        { Name: 'frostWindows', Status: 'ON' },
                        { Name: 'modifyACTemp', Status: 'ON' },
                        { Name: 'doorsControl', Status: 'ON' },
                        { Name: 'windowsControl', Status: 'ON' },
                        { Name: 'smartWindowsControl', Status: 'ON' },
                        { Name: 'powerSupply', Status: 'ON' },
                        { Name: 'waterSupply', Status: 'ON' },
                        { Name: 'audioSystem', Status: 'ON' },
                        { Name: 'stove', Status: 'ON' },
                        { Name: 'oven', Status: 'ON' },
                    ]
                },
                {
                    Name: 'Cameras',
                    Permissions: [
                        { Name: 'kitchen', Status: 'ON' },
                        { Name: 'livingRoom', Status: 'ON' },
                        { Name: 'Bedroom', Status: 'EMERGENCY' },
                    ]
                },
                {
                    Name: 'Lighting',
                    Permissions: [
                        { Name: 'turnLights', Status: 'ON' },
                        { Name: 'modifyIntensity', Status: 'ON' },
                        { Name: 'switchLightscene', Status: 'ON' },
                        { Name: 'addPersonalLightscene', Status: 'ON' },
                        { Name: 'addGlobalLightscene', Status: 'ON' },
                        { Name: 'manageGlobalLightscene', Status: 'ON' },
                    ]
                },
                {
                    Name: 'AccessManagement',
                    Permissions: [
                        { Name: 'inviteGuests', Status: 'ON' },
                    ]
                },
                {
                    Name: 'SeapodInfo',
                    Permissions: [
                        { Name: 'serialNumber', Status: 'ON' },
                        { Name: 'modelInfoAndSpec', Status: 'ON' },
                    ]
                },
            ],
            isDefault: true
        });
        await owner.save();

        seapod.permissionSets.push(
            guest._id,
            member._id,
            visitor._id,
            admin._id,
            owner._id
        );
        return seapod;
    }

    async addNewPermission(seapodId, userId, permissionData) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const seapod = await SeaPod.findById(seapodId).populate('permissionSets');
            if (!seapod) {
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'SeaPod Not Found!'
                };
            }

            let isOwner = isOwnerAtSeaPod(seapod.users, userId);
            if (!isOwner) return {
                isError: true,
                statusCode: 403,
                error: 'Access denied. Not the Owner of the seapod!'
            };

            for (var i in seapod.permissionSets) {
                if (seapod.permissionSets[i].Name.toLowerCase() === permissionData.Name.toLowerCase()) {
                    return {
                        isError: true,
                        statusCode: 400,
                        error: 'Duplicated Permission Name!'
                    };
                }
            }

            permissionData['isDefault'] = false;
            const permission = new Permission(permissionData);
            seapod.permissionSets.push(permission._id);

            await permission.save();
            await seapod.save();
            await session.commitTransaction();

            return {
                isError: false,
                statusCode: 201,
                permission: permission
            }

        } catch (error) {
            await session.abortTransaction();
            return {
                statusCode: 500,
                error: error.message
            };
        } finally {
            session.endSession();
        }
    }

    async updatePermission(seapodId, userId, permissionData) {
        try {
            const seapod = await SeaPod.findById(seapodId).populate('permissionSets');
            if (!seapod) {
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'SeaPod Not Found!'
                };
            }
            let isOwner = isOwnerAtSeaPod(seapod.users, userId);
            if (!isOwner) return {
                isError: true,
                statusCode: 403,
                error: 'Access denied. Not the Owner of the seapod!'
            };

            let existedPermission;
            seapod.permissionSets.forEach(perm => {
                if (perm._id == permissionData._id) existedPermission = perm._id;
            });
            if (!existedPermission) return {
                isError: true,
                statusCode: 404,
                error: 'Permission Not Found'
            };

            const permission = await Permission.findById(existedPermission);
            if (permission.isDefault == true && permissionData.Name != permission.Name) {
                return {
                    isError: true,
                    statusCode: 400,
                    error: 'Default Permission cannot be renamed!'
                };
            }

            for (var i in seapod.permissionSets) {
                if (seapod.permissionSets[i].Name.toLowerCase() === permissionData.Name.toLowerCase()) {
                    if (seapod.permissionSets[i].Name.toLowerCase() === permission.Name.toLowerCase()) continue;

                    return {
                        isError: true,
                        statusCode: 400,
                        error: 'Duplicated Permission Name!'
                    };
                }
            }

            await Permission.updateOne({ _id: permission._id }, { $set: permissionData });

            return {
                isError: false,
                statusCode: 200,
                permission: permissionData
            }

        } catch (error) {
            return {
                statusCode: 500,
                error: error.message
            };
        }
    }

    async updatePermissionName(permissionId, permissionName, seapodId, userId) {
        const seapod = await SeaPod.findById(seapodId).populate('permissionSets');
        if (!seapod) {
            return {
                isError: true,
                statusCode: 404,
                error: 'SeaPod Not Found!'
            };
        }

        let isOwner = isOwnerAtSeaPod(seapod.users, userId);
        if (!isOwner) return {
            isError: true,
            statusCode: 403,
            error: 'Access denied. Not the Owner of the seapod!'
        };

        let existedPermission;
        seapod.permissionSets.forEach(perm => {
            if (perm._id == permissionId) existedPermission = perm._id;
        });
        if (!existedPermission) return {
            isError: true,
            statusCode: 404,
            error: 'Permission Not Found'
        };

        const permission = await Permission.findById(existedPermission);
        if (permission.isDefault == true && permission.Name != permissionName) {
            return {
                isError: true,
                statusCode: 400,
                error: 'Default Permission cannot be renamed!'
            };
        }

        for (var i in seapod.permissionSets) {
            if (seapod.permissionSets[i].Name.toLowerCase() === permissionName.toLowerCase()) {
                if (seapod.permissionSets[i].Name.toLowerCase() === permission.Name.toLowerCase()) continue;

                return {
                    isError: true,
                    statusCode: 400,
                    error: 'Duplicated Permission Name!'
                };
            }
        }

        permission.Name = permissionName;
        await permission.save();

        return {
            isError: false,
            updatePermisson: permission
        }
    }

    async deletePermission(permissionId, seapodId, userId) {
        try {
            const seapod = await SeaPod.findById(seapodId).populate('permissionSets');
            if (!seapod) {
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'SeaPod Not Found!'
                };
            }

            let isOwner = isOwnerAtSeaPod(seapod.users, userId);
            if (!isOwner) return {
                isError: true,
                statusCode: 403,
                error: 'Access denied. Not the Owner of the seapod!'
            };

            let existedPermission;
            seapod.permissionSets.forEach(perm => {
                if (perm._id == permissionId) existedPermission = perm._id;
            });
            if (!existedPermission) return {
                isError: true,
                statusCode: 404,
                error: 'Permission Not Found'
            };

            const permission = await Permission.findById(permissionId);
            if (permission.isDefault == true) {
                return {
                    isError: true,
                    statusCode: 400,
                    error: 'Default Permission cannot be deleted!'
                };
            }

            seapod.users.forEach(user => {
                if (user.permissionSet == permissionId) {
                    seapod.permissionSets.forEach(perm => {
                        if (perm.Name == `Default ${user.type} Permissions`) {
                            user['permissionSet'] = perm._id;
                        }
                    });
                }
            });

            await Permission.findByIdAndDelete(permissionId);
            await SeaPod.updateOne({ _id: seapodId }, { $pull: { 'permissionSets': permissionId } });

            await seapod.save();
            return {
                isError: false,
                statusCode: 200,
                permission: permission
            }

        } catch (error) {
            return {
                statusCode: 500,
                error: error.message
            };
        }
    }

    async updatePermissionSet(seapodId, userId, permissionId, ownerId) {
        const seapod = await SeaPod.findById(seapodId).populate('permissionSets');
        if (!seapod) {
            return {
                isError: true,
                statusCode: 404,
                error: 'SeaPod Not Found!'
            };
        }

        let isOwner = isOwnerAtSeaPod(seapod.users, ownerId);
        if (!isOwner) return {
            isError: true,
            statusCode: 403,
            error: 'Access denied. Not the Owner of the seapod!'
        };

        let existedPermission;
        seapod.permissionSets.forEach(permission => {
            if (permission._id == permissionId) existedPermission = true;
        });
        if (!existedPermission) return {
            isError: true,
            statusCode: 404,
            error: 'Permission Not Found'
        };

        let userAtSeapod, i;
        seapod.users.forEach((user, index) => {
            if (user._id == userId) {
                userAtSeapod = user;
                i = index;
            }
        });
        if (!userAtSeapod) return {
            isError: true,
            statusCode: 404,
            error: 'User is not at Seapod'
        };

        userAtSeapod['permissionSet'] = permissionId;
        await seapod.populate('users.permissionSet').execPopulate();
        await seapod.save();

        return {
            isError: false,
            user: seapod.users[i]
        }
    }

    async revokePermissionSet(seapodId, userId, ownerId) {
        const seapod = await SeaPod.findById(seapodId).populate('permissionSets');
        if (!seapod) return {
            isError: true,
            statusCode: 404,
            error: 'SeaPod Not Found!'
        };

        let isOwner = isOwnerAtSeaPod(seapod.users, ownerId);
        if (!isOwner) return {
            isError: true,
            statusCode: 403,
            error: 'Access denied. Not the Owner of the seapod!'
        };

        let userAtSeapod, i, type;
        seapod.users.forEach((user, index) => {
            if (user._id == userId) {
                userAtSeapod = user;
                i = index;
                type = user.type;
            }
        });
        if (!userAtSeapod) return {
            isError: true,
            statusCode: 404,
            error: 'User is not at Seapod'
        };

        seapod.permissionSets.forEach(permission => {
            if (permission.Name == `Default ${type} Permissions`) {
                userAtSeapod['permissionSet'] = permission._id;
            }
        });

        await seapod.populate('users.permissionSet').execPopulate();
        await seapod.save();

        return {
            isError: false,
            user: seapod.users[i]
        }
    }

    async addDefaultPremissionSet(userId, seapod) {
        let userAtSeapod, type;
        seapod.users.forEach(user => {
            if (user._id == userId) {
                userAtSeapod = user;
                type = user.type;
            }
        });
        if (!userAtSeapod) return {
            isError: true,
            statusCode: 404,
            error: 'User is not at Seapod'
        };

        seapod.permissionSets.forEach(permission => {
            if (permission.Name == `Default ${type} Permissions`) {
                userAtSeapod['permissionSet'] = permission._id;
            }
        });
        await seapod.populate('users.permissionSet').execPopulate();

        return seapod;
    }

    async getSeapodPermissionSets(seapodId) {
        const seapod = await SeaPod.findById(seapodId).populate('permissionSets');
        if (!seapod) return {
            isError: true,
            statusCode: 404,
            error: 'SeaPod Not Found!'
        };

        return {
            isError: false,
            permission: seapod.permissionSets
        }
    }

    async getPermissionSet(permissionId) {
        const permission = await Permission.findById(permissionId);
        if (!permission) return {
            isError: true,
            statusCode: 404,
            error: 'Permission Not Found!'
        };

        return {
            isError: false,
            permission: permission
        }
    }

}

exports.PermissionService = PermissionService;