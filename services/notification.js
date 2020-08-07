const { User } = require('../models/users/user');

class NotificationService {
    async updateNotificationSeenStatus(notificationId, userId) {
        const user = await User.findById(userId);
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: "User Not Found"
        }

        const notification = user.notifications.id(notificationId);
        if (!notification) return {
            isError: true,
            statusCode: 404,
            error: 'Notification Not Found'
        }

        notification.seen = !notification.seen;
        await user.save();

        return {
            isError: false,
            notificationData: notification
        }
    }

    async updateAllNotificationSeenStatus(notificationsIds, userId) {
        const user = await User.findById(userId);
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: "User Not Found"
        }

        for (const notificationId of notificationsIds) {
            const notificationItem = user.notifications.id(notificationId);
            if (notificationItem)
                notificationItem.seen = true;
        }

        await user.save();

        return {
            isError: false,
            notificationData: user.notifications.reverse()
        }
    }

    async updateNotificationSettings(userId, settings) {
        const user = await User.findById(userId);
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: "User Not Found"
        }

        const filteredSettings = settings.filter(function (item) {
            return item.name !== 'URGENT NOTIFICATIONS';
        })

        filteredSettings.push({
            name: 'URGENT NOTIFICATIONS',
            phone: 'URGENT',
            mail: 'URGENT'
        })

        user.notificationSettings = filteredSettings;
        await user.save();

        return {
            isError: false,
            notificationData: user.notificationSettings
        }
    }
}

module.exports = NotificationService;