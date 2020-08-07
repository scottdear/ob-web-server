const { sendMultipleNotification } = require('./fcmNotifier');

class Notifier {
    static async createAndSendNotification(tokens, notificationContainer) {
        const payload = {
            data: {
                notification: JSON.stringify({
                    title: notificationContainer.title,
                    body: notificationContainer.body
                }),
                data: JSON.stringify({
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    notificationData: JSON.stringify(notificationContainer.data),
                    type: notificationContainer.type
                }),
            },
            tokens: tokens
        }
        sendMultipleNotification(payload, tokens);
    }
}
module.exports = Notifier;