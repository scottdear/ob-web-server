const utilites = require('../../../helpers/utilites');

describe('utilites helpers', () => {    
    it('should return fake data sets with 2 elements', () => {
        const num = 2;
        const res = utilites.generateFakeData(num);
        expect(res).toHaveLength(num);
        expect(res[0]).toHaveProperty('insideTemperature');
    });

    it('should return false if user is undefined', () => {
        const userId = 1;
        const seapodUsers = [];
        const res = utilites.isOwnerAtSeaPod(seapodUsers, userId);
        expect(res).toBeFalsy();
    });

    it('should return false if user is not the owner', () => {
        const userId = 1;
        const seapodUsers = [{ _id: 1 , type: "MEMBER"}];
        const res = utilites.isOwnerAtSeaPod(seapodUsers, userId);
        expect(res).toBeFalsy();
    });

    it('should return true if user is the owner', () => {
        const userId = 1;
        const seapodUsers = [{ _id: 1 , type: "OWNER"}];
        const res = utilites.isOwnerAtSeaPod(seapodUsers, userId);
        expect(res).toBeTruthy();
    });
    
});