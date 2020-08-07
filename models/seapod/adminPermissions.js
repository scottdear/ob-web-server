const mongoose=require('mongoose');

module.exports=new mongoose.Schema({
    canOpenWindos:{type:Boolean,default:false},
});