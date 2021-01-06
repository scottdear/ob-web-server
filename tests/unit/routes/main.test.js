const request = require('supertest');
let server;

jest.useFakeTimers()

describe('main router', () => {    
    beforeEach(() => { server = require('../../../index'); })

    afterEach(async () => {
        server.close();
    }); 

    it('GET /', async () => {
        const res =  await request(server).get('/');

        expect(res.status).toBe(302);
        expect(res.redirect).toBe(true);
        expect(res.text).toEqual(expect.stringContaining('https://ocean.builders/'));
    });
})