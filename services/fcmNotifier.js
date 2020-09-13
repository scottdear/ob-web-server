const admin = require('firebase-admin');
const config = require('config');

admin.initializeApp({
    credential: admin.credential.cert({
        "type": config.get("type"),
        "project_id": config.get("projectId"),
        "private_key_id": config.get("privateKeyId"),
        "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": config.get("clientEmail"),
        "client_id": config.get("clientId"),
        "auth_uri": config.get("authUri"),
        "token_uri": config.get("tokenUri"),
        "auth_provider_x509_cert_url": config.get("authProviderX509CertUrl"),
        "client_x509_cert_url": config.get("clientX509CertUrl")
    }),
    databaseURL: 'https://ocean-builder.firebaseio.com'
});

exports.sendMultipleNotification = function (notificationData, tokens) {
    // console.log(notificationData);
    admin.messaging().sendMulticast(notificationData).then((response) => {
        const failedTokens = [];
        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success)
                    failedTokens.push(tokens[idx]);
            });
            // console.log('List of tokens that caused failures: ' + failedTokens);
        }
    });
}