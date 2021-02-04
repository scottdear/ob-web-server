const { sendMultipleNotification } = require('./fcmNotifier');

class Notifier {
    static async createAndSendNotification(tokens, notificationContainer) {
        const message = {
            notification: {
                title: notificationContainer.title,
                body: notificationContainer.data
            },
            data: {
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                notificationData: JSON.stringify(notificationContainer.data),
                type: notificationContainer.type
            },
            tokens: tokens
        }
        sendMultipleNotification(message);
    }
}
module.exports = Notifier;