const Notifier = require('../services/notifier');
const { addNotificationDataToUser } = require('../services/user');

module.exports = function (eventEmitter) {
    eventEmitter.on('sendRequestAccessNotification', Notifier.createAndSendNotification);
    eventEmitter.on('addNotificationDataToOnwers', addNotificationDataToUser);
}