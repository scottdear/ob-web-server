const validation = require('../../../services/validation');
const mongoose = require('mongoose');

describe('validation service', () => {       
    it('should return validation error for Auth Credentials', () => {
        const credentials = {
            email: 'someone@company.com',
            password: 'bad password'
        }
        
        const res = validation.ValidateAuthCredentials(credentials);
        expect(res).toHaveProperty('error');
    });

    it('should return validation error of Password', () => {
        const passwords = {
            currentPassword: 'bad password',
            newPassword: 'bad password also'
        }
        
        const res = validation.ValidatePassword(passwords);
        expect(res).toHaveProperty('error');
    });

    it('should not return validation error of User', () => {
        const user = {
            firstName: 'Name',
            lastName: 'Name',
            email: 'someone@company.com',
            mobileNumber: '+201111111111',
            country: 'country'
        }
        
        const res = validation.ValidateUserUpdateData(user);
        expect(res).not.toHaveProperty('error');
    });

    it('should not return validation error of Token', () => {
        const totpToken = {
            secret: new Array(33).join('a'),
            token: 1
        }
        
        const res = validation.validateTotpToken(totpToken);
        expect(res).not.toHaveProperty('error');
    });

    it('should not return validation error of Token', () => {
        const id = mongoose.Types.ObjectId().toHexString();

        const res = validation.validateObjectId(id);
        expect(res).not.toHaveProperty('error');
    });

    it('should not return validation error of Seapod Name', () => {
        const seapodName = {
            seapodName: new Array(10).join('a')
        }
        
        const res = validation.validateSeapdName(seapodName);
        expect(res).not.toHaveProperty('error');
    });

    it('should not return validation error of Permission Name', () => {
        const Name = {
            Name: new Array(10).join('a')
        }
        
        const res = validation.validatePermissionName(Name);
        expect(res).not.toHaveProperty('error');
    });

    it('should not return validation error of Emergency Contacts', () => {
        const emergencyContact = {
            _id: mongoose.Types.ObjectId().toHexString(),
            firstName: 'Name',
            lastName: 'Name',
            email: 'someone@company.com',
            mobileNumber: '+201111111111',
        }
        
        const res = validation.validateEmergencyContacts(emergencyContact);
        expect(res).not.toHaveProperty('error');
    });

    it('should not return validation error of Access Request', () => {
        const requestAccessTypeAndTime = {
            type: 'MEMBER',
            period: 1
        }
        
        const res = validation.validateAcceptAccessRequest(requestAccessTypeAndTime);
        expect(res).not.toHaveProperty('error');
    });

    it('should not return validation error of Email', () => {
        const email = {
            email: 'someone@company.com'
        }
        
        const res = validation.validateEmailAddress(email);
        expect(res).not.toHaveProperty('error');
    });

    it('should not return validation error of Notification Id', () => {
        const notificationIds = {
            notificationIds: ['a', 'b']
        }
        
        const res = validation.validateNotificationIds(notificationIds);
        expect(res).not.toHaveProperty('error');
    });

});