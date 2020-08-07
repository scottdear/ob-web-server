const mongoose=require('mongoose');

const verificationTokenSchema=new mongoose.Schema({
    _userId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Users'},
    token:{type:String,required:true},
    createdAt:{type:Date,required:true,default:Date.now,expires:43200}
});

const VerificationToken=mongoose.model('Tokens',verificationTokenSchema);

exports.VerificationToken=VerificationToken;