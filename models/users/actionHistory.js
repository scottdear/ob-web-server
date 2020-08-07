const mongoose=require('mongoose');

module.exports=new mongoose.Schema({
    action:{type:String,required:true},
    actionResult:{type:String,required:true},
    tokenAndDeviceId:{type:String,required:true,match:/^[0-9a-fA-F]{24}$/,},
    itemId:{type:String,required:true,match:/^[0-9a-fA-F]{24}$/,},
});