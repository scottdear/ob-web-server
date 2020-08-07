const { RequestAccess , ValidateRequest} = require('../../../models/accessRequest');

describe('accessRequest model', () => {    
    it('should pass the validation', () => {
        const req = new RequestAccess({
            type: "GUEST",
            period: 86400000,
            vessleCode: "S9F22D1",
            checkIn: 1581191756216
        });
        const res = ValidateRequest(req);
        expect(res).toBeTruthy();
    });

    it('should return error if type is missing', () => {
        const req = new RequestAccess({
            period: 86400000,
            vessleCode: "S9F22D1",
            checkIn: 1581191756216
        });
        const res = ValidateRequest(req);
        expect(res.error.message).toEqual(expect.stringMatching(/is required$/));
    });

    it('should return error if period is missing', () => {
        const req = new RequestAccess({
            type: "GUEST",
            vessleCode: "S9F22D1",
            checkIn: 1581191756216
        });
        const res = ValidateRequest(req);
        expect(res.error.message).toEqual(expect.stringMatching(/is required$/));
    });

    it('should return error if vessleCode is missing', () => {
        const req = new RequestAccess({
            type: "GUEST",
            period: 86400000,
            checkIn: 1581191756216
        });
        const res = ValidateRequest(req);
        expect(res.error.message).toEqual(expect.stringMatching(/is required$/));
    });

    it('should return error if checkIn is missing', () => {
        const req = new RequestAccess({
            type: "GUEST",
            period: 86400000,
            vessleCode: "S9F22D1"
        });
        const res = ValidateRequest(req);
        expect(res.error.message).toEqual(expect.stringMatching(/is required$/));
    });
});