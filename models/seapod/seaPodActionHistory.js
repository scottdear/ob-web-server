const mongoose=require('mongoose');

module.exports=new mongoose.Schema({
    action:{type:String,required:true},
    actionResult:{type:String,required:true},
    userId:{type:mongoose.Schema.Types.ObjectId,required:true},
    userName:{type:String,required:true},
    userType:{type:String,enum:['ADMIN','OWNER','MEMBER','GUEST','TENANT','DEMO']}
});