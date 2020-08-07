const sgMail = require('@sendgrid/mail');
const config = require('config');

class MailService {
    constructor() {
        sgMail.setApiKey(config.get('SENDGRID_API_KEY'));
    }

    async sendVerificationMail(to, verificationUrl) {
        const msg = {
            to: to,
            from: 'info@oceanbuilder.com',
            subject: 'Welcome to Ocean Builder',
            text: `please follow the following url to verifiy your account: ${verificationUrl}`,
            // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        };
        await sgMail.send(msg);
    }

    async sendForgetPasswordMail(to, url) {
        const msg = {
            to: to,
            from: 'noreply@oceanbuilder.com',
            subject: 'Reset Password',
            html: `<p>you are receiving this because you have requested a reset of your password.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Please follow the following url, or paste it in your browser: <a href='${url}'>click here</a></p>`
        };
        await sgMail.send(msg);
    }
}

exports.MailService = MailService;