const _ = require('lodash');

function filterUserData(user) {
    return _.omit(user, ['loginAuditTrials', 'tokensAndDevices', 'actionHistorys', 'previousPasswords', 'loginHistory', 'password']);
}

function filterSeapodData(seapod) {
    seapod = _.omit(seapod, ['actionsHistory', 'adminPermissions']);
    let users = [];
    seapod.users.forEach(seaPodUser => {
        seaPodUser = _.omit(seaPodUser, ['permissions', 'notificationToken', ]);
        users.push(seaPodUser);
    });
    seapod.users = users;

    return seapod;
}

function getCurrentUserFromSeapodUsers(userId, seaPodUsers) {
    for (const user of seaPodUsers)
        if (user._id == userId)
            return user;
}

exports.filterUserAndSeapod = function (user, seapod, fakeData) {
    user = filterUserData(user);

    seapod['data'] = fakeData;
    seapod.user = seapod.users[0];
    seapod.users[0] = _.omit(seapod.users[0], ['permissions', 'notificationToken', ]);

    seapod = _.omit(seapod, ['actionsHistory', 'adminPermissions']);
    user.seaPods = [seapod];

    return user;
}

function filterSeapods(seaPods, userId, fakeData) {
    let sps = [];
    for (let index = 0; index < seaPods.length; index++) {
        let sp = seaPods[index];
        sp['user'] = getCurrentUserFromSeapodUsers(userId, sp.users);
        sp['data'] = fakeData[index];
        sps.push(filterSeapodData(sp))
    }

    return sps;
}
exports.filterUserAndSeapods = function (user, fakeData) {
    user = filterUserData(user);

    user.seaPods = filterSeapods(user.seaPods, user._id, fakeData);
    return user;
}
exports.filterSeaPods = function (seaPods, userId, fakeData) {
    return filterSeapods(seaPods, userId, fakeData);
}
exports.filterUser = function (user) {
    return filterUserData(user);
}

exports.filterUserTokensAndDevices = function (users) {
    for (const user of users) {
        let filterTokensAndDevices = [];
        for (const tokenAndDevice of user.tokensAndDevices)
            filterTokensAndDevices.push(_.pick(tokenAndDevice, ['_id', 'notificationToken', 'hardwareId', 'model']));
        user.tokensAndDevices = filterTokensAndDevices;
    }

    return users;
}