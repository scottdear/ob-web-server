const mongoose=require('mongoose');

module.exports=new mongoose.Schema({
    firstName: {
        type: String,
        required:true,
        minlength: 3,
        maxlength: 50,
        match:/[A-Za-z]./
    },
    lastName: {
        type: String,
        required:true,
        minlength: 3,
        maxlength: 50,
        match:/[A-Za-z]./
    },
    email:{
        type:String,
        required:true,
        match:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    mobileNumber:{
        type:String,
        required:true,
        match:/^(\+\d{1,3}[- ]?)?\d{10}$/
    }
});

