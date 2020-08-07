const mongoose=require('mongoose');

module.exports= new mongoose.Schema(
    {
        jti:{type:String,required:true},
        notificationToken:{type:String,required:true},
        hardwareId:{type:String,required:true},
        model:{type:String,required:true}
    });