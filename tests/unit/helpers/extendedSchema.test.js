const extendSchema = require('../../../helpers/extendSchema');
const mongoose = require('mongoose');

describe('extendSchema helper', () => {    
    it('should return instance of Schema class', () => {
        const schema = {};
        const definition = {};
        const options = {};
        const res = extendSchema(schema, definition, options);
        expect(res).toBeInstanceOf(mongoose.Schema);
    });
});