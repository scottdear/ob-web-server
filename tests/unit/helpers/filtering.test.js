const filtering = require('../../../helpers/filtering');

describe('filtering helper', () => {    
    it('should return filtered user object with seapod', () => {
        const user = {
            loginAuditTrials: 'a',
            tokensAndDevices: []
        };
        const seapod = {
            users: [],
            user: {
                permissions: 'a',
                notificationToken: 'b'
            },
            actionsHistory: [],
        };
        const data = 'a';
        const res = filtering.filterUserAndSeapod(user, seapod, data);
        expect(res).not.toHaveProperty('loginAuditTrials');
        expect(res).toHaveProperty('seaPods');
        expect(res.seaPods[0]).not.toHaveProperty('actionsHistory');
        expect(res.seaPods[0]).toHaveProperty('data');
    });

    it('should return filtered user object with seapods', () => {
        const seapod = { users: [ 
            { _id: 1 }
        ]}
        const user = {
            _id: 1,
            loginAuditTrials: 'a',
            tokensAndDevices: [],
            seaPods: [seapod]
        };
        const data = 'a';
        const res = filtering.filterUserAndSeapods(user, data);
        expect(res).not.toHaveProperty('loginAuditTrials');
        expect(res).toHaveProperty('seaPods');
        expect(res.seaPods[0]).toHaveProperty('user');
    });

    it('should return filtered seapods array', () => {
        const seapod1 = { users: [
            { _id: 1 },
            { _id: 2 }
        ]}
        const seapod2 = { users: [
            { _id: 3 },
            { _id: 4 }
        ]}
        const seaPods = [seapod1, seapod2];
        const data = ['a', 'b'];
        const res = filtering.filterSeaPods(seaPods, 1, data);
        expect(res[0].user).toHaveProperty('_id', 1);
        expect(res[1].user).toBeUndefined(); //should it return undefined or should it return nothing??
    });

    it('should return filtered user object and filtered token and devices', () => {
        const user = {
            loginAuditTrials: 'a',
            tokensAndDevices: []
        };
        const res = filtering.filterUser(user);
        expect(res).not.toHaveProperty('loginAuditTrials');
    });

    it('should return user object with seapods', () => {
        const users = [{
            _id: 1,
            loginAuditTrials: 'a',
            tokensAndDevices: [{
                _id: 1,
                jti: 2
            }]
        }];
        const res = filtering.filterUserTokensAndDevices(users);
        expect(res[0].tokensAndDevices[0]).toHaveProperty('_id');
        expect(res[0].tokensAndDevices[0]).not.toHaveProperty('jti');
    });
});