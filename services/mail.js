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

    async sendConfirmationMail(to, name, url) {
        const msg = {
            to: to,
            from: 'noreply@oceanbuilder.com',
            subject: 'Confirm Your Email',
            html: `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            
            <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Varela">
            <title>Ocean Builders Email</title>
            <style type="text/css">
            body {margin: 0; padding: 0; min-width: 100%!important;}
            img {height: auto;}
            .content {width: 100%;}
            .header {padding: 40px 30px 20px 30px; background: linear-gradient(180deg, #043D8D 0%, #2C86AC 100%); height: 168px;}
            .header img { width: 165px; height: auto; margin: auto; display: block; }
            .innerpadding {padding: 30px 30px 30px 30px;}
            .borderbottom {border-bottom: 1px solid #f2eeed;}
            .subhead {font-size: 15px; color: #ffffff; font-family: "Varela", sans-serif; letter-spacing: 10px;}
            .h1, .h2, .bodycopy {font-family: "Varela", sans-serif;}
            .h1 {font-size: 33px; line-height: 38px; font-weight: bold;}
            .h2 {padding: 50px 0 20px 0; font-size: 30px; line-height: 28px; font-weight: normal; text-align: center; color: #707070}
            .bodycopy {font-size: 14px; line-height: 22px; font-weight: normal; text-align: center; color: #707070; padding: 40px 0;}
            .button {width: 305px; height: 33px; background: #2D68BF; border: 1px solid #2D68BF; border-radius: 28px; text-align: center; font-size: 13px; font-family: "Varela", sans-serif; font-weight: normal; padding: 0 30px 0 30px;}
            .button a {color: #fff; text-transform: uppercase;}
            .footer {padding: 20px 30px 15px 30px;}
            .footercopy {font-family: "Varela", sans-serif; font-size: 14px; color: #707070; padding: 5px;}
            .footercopy a {color: #707070; text-decoration: underline;}

            @media only screen and (max-width: 550px), screen and (max-device-width: 550px) {
            body .hide {display: none!important;}
            body .buttonwrapper {background-color: transparent!important;}
            body .button {padding: 0px!important;}
            body .button a {background-color: #2D68BF;}
            body .unsubscribe {display: block; margin-top: 20px; padding: 10px 50px; background: #2f3942; border-radius: 5px; text-decoration: none!important; font-weight: bold;}
            }

            </style>
            </head>

            <body bgcolor="#fff">
            <table width="100%" bgcolor="#f1f5f8" border="0" cellpadding="0" cellspacing="0">
            <tr>
            <td>
                <table bgcolor="#ffffff" class="content" align="center" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td class="header">
                        <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/logo.png" width="70" height="70" border="0" alt="" />
                    </td>
                </tr>
                <tr>
                    <td class="innerpadding borderbottom">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                        <td class="h2">
                            Email Confirmation
                        </td>
                        </tr>
                        <tr>
                        <td class="bodycopy">
                            Hi ${name}. Thanks for joining our community. <br> 
                            Click this button to verify your email address and finish setting up your account.
                        </td>
                        </tr>
                    </table>
                    <table align="center" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                        <td class="button">
                            <a href="${url}">confirm your email address</a>
                        </td>
                        </tr>
                        <tr>
                        <td class="bodycopy">
                            If you received this email by mistake, simply delete it. <br>
                            For questions about this, please contact: <a href="mailto:customer@oceanbuilders.com">customer@oceanbuilders.com</a>
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>
                <tr>
                    <td class="footer" bgcolor="#fff">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                        <td align="center" class="footercopy">
                            Cheers!
                        </td>
                        </tr>
                        <tr>
                            <td align="center" class="footercopy">
                            The Ocean Builders Team
                            </td>
                        </tr>
                        <tr>
                        <td align="center" style="padding: 20px 0 0 0;">
                            <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                            <td width="30" style="text-align: center; padding: 0 5px 0 5px;">
                                <a href="https://www.facebook.com/OceanBuildersOfficial">
                                    <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/facebook.png" width="30" height="30" alt="Facebook" border="0" />
                                </a>
                            </td>
                            <td width="30" style="text-align: center; padding: 0 5px 0 5px;">
                                <a href="https://www.instagram.com/ocean_builders/">
                                    <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/instagram.png" width="30" height="30" alt="Instagram" border="0" />
                                </a>
                            </td>
                            <td width="30" style="text-align: center; padding: 0 5px 0 5px;">
                                <a href="https://twitter.com/oceanbuilders">
                                    <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/twitter.png" width="30" height="30" alt="Twitter" border="0" />
                                </a>
                            </td>
                            <td width="30" style="text-align: center; padding: 0 5px 0 5px;">
                                <a href="https://www.linkedin.com/company/oceanbuilders/">
                                    <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/linkedin.png" width="30" height="30" alt="LinkedIn" border="0" />
                                </a>
                            </td>
                            <td width="30" style="text-align: center; padding: 0 5px 0 5px;">
                                <a href="https://www.youtube.com/channel/UCzA2-xKrPZZPmXz7XfoMVIQ">
                                    <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/youtube.png" width="30" height="30" alt="YouTube" border="0" />
                                </a>
                            </td>
                            </tr>
                            </table>
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>
                </table>
                </td>
            </tr>
            </table>
            </body>
            </html>`
        };
        await sgMail.send(msg);
    }
}

exports.MailService = MailService;