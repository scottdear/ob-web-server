const CronJob = require('cron').CronJob;
const { SeaPodService } = require('../services/seapod');
const Notifier = require('../services/notifier');
const { addNotificationDataToUser } = require('../services/user');

function getNotificationTokens(seaPodUsers) {
    const notificationTokens = [];

    seaPodUsers.forEach(spu => {
        notificationTokens.push(spu.notificationToken);
    });

    return notificationTokens;
}

function getUsersIds(seaPodUsers) {
    const userIds = [];
    seaPodUsers.forEach(spu => {
        userIds.push(spu._id);
    });

    return userIds;
}

const urgentNotifications = [{
    "title": "Solar Radiation Storm. X-Ray Emissions from the sun",
    "message": "URGENT NOTIFICATION",
    "data": "solar"
},
{
    "title": "15% Battery. Low Power Mode",
    "message": "URGENT NOTIFICATION",
    "data": "battery"
},
{
    "title": "2m Waves. Red Flag aroung the coast",
    "message": "URGENT NOTIFICATION",
    "data": "wave"
}
];

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


module.exports = function () {
    const job = new CronJob("00 23 * * *", async function () {
        const seapodService = new SeaPodService();
        const seapods = seapodService.getAllSeapods();

        for (const seapod of seapods) {
            const notificationData = urgentNotifications[getRandomInt(urgentNotifications.length)];
            await Notifier.createAndSendNotification(getNotificationTokens(seapod.users), notificationData);
            await addNotificationDataToUser(getUsersIds(seapod.users), notificationData);
        }
    });

    job.start();
}