const mongoose=require('mongoose');

module.exports=new mongoose.Schema({
    name: {
        type: String,
        required: true
    },    
    phone: {
        type: String, 
        enum: ['ON','OFF','URGENT'],
        required: true
    },
    mail: {
        type: String, 
        enum: ['ON','OFF','URGENT'],
        required: true
    }
});