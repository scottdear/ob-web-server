const accessManagement = require('../../../services/accessManagement');

describe('accessManagement service', () => {
    describe('areEqual method', () => {
        it('should return false when request body equals access request', () => {
            const reqBody = {
                type: 'GUEST',
                period: 0,
                checkIn: 1234
            }

            const accessRequest = {
                type: 'GUEST',
                period: 1,
                checkIn: 1234
            }

            const res = new accessManagement().areEqual(reqBody, accessRequest);
            expect(res).toBe(false);
        })
        
        it('should return true when request body equals access request', () => {
            const reqBody = {
                type: 'GUEST',
                period: 0,
                checkIn: 1234
            }

            const accessRequest = {
                type: 'GUEST',
                period: 0,
                checkIn: 1234
            }

            const res = new accessManagement().areEqual(reqBody, accessRequest);
            expect(res).toBe(true);
        })
    })
    
    describe('formatePeriodTime method', () => {
        it('should return PERMANENT ACCESS', () => {
            const period = 0;

            const res = new accessManagement().formatePeriodTime(period);
            expect(res).toBe('PERMANENT ACCESS');
        })

        it('should return periodTime in specific format', () => {
            const period = 86400000;

            const res = new accessManagement().formatePeriodTime(period);
            expect(res).toEqual('1 DAY');
        })

        it('should return periodTime in specific format', () => {
            const period = 259200000;

            const res = new accessManagement().formatePeriodTime(period);
            expect(res).toEqual(expect.stringContaining('DAYS'));
        })

        it('should return periodTime in specific format', () => {
            const period = 2592000000;

            const res = new accessManagement().formatePeriodTime(period);
            expect(res).toEqual('1 MONTH');
        })

        it('should return periodTime in specific format', () => {
            const period = 25920000000;

            const res = new accessManagement().formatePeriodTime(period);
            expect(res).toEqual(expect.stringContaining('MONTHS'));
        })
        
        it('should return periodTime in specific format', () => {
            const period = 31536000000;

            const res = new accessManagement().formatePeriodTime(period);
            expect(res).toEqual('1 YEAR');
        })

        it('should return periodTime in specific format', () => {
            const period = 94608000000;

            const res = new accessManagement().formatePeriodTime(period);
            expect(res).toEqual(expect.stringContaining('YEARS'));
        })
    })

    describe('formateCheckInDate method', () => {
        it('should return PERMANENT ACCESS', () => {
            const checkIn = 1552191756216;

            const res = new accessManagement().formateCheckInDate(checkIn);
            expect(res).toEqual(expect.stringMatching(/([a-zA-Z]+) (0[1-9]|[12]\d|3[01]), ([12]\d{3})/));
        })
    })
});