const mongoose=require('mongoose');

module.exports=new mongoose.Schema({
    status:{
        type:Boolean,
        default:false
    },
    selectedScene:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'LightiningScenes',
    },
    intensity:{
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        required: true
    },
    lightScenes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'LightiningScenes',
        default:[]
    }]
});