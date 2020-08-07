const sgMail = require('@sendgrid/mail');
const mailService = new(require('../../../services/mail'))();

jest.mock("@sendgrid/mail", () => {
    return {
      setApiKey: jest.fn(),
      send: jest.fn()
    };
});

describe('access management service', () => {    
    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });
      
    it("should send mail with specefic value", async done => {
        const to = "receiver@mail.com";
        const verificationUrl = "URL";
        
        await mailService.sendVerificationMail(to, verificationUrl);
        setImmediate(() => {
            expect(sgMail.send).toBeCalledWith({
                to: "receiver@mail.com",
                from: 'info@oceanbuilder.com',
                subject: 'Welcome to Ocean Builder',
                text: 'please follow the following url to verifiy your account: URL',
            });
            done();
        });
    });
})