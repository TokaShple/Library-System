import mongoose from 'mongoose';
const userSchema=mongoose.Schema({
  name:{type:String,required:true},
  email:{type:String,required:true,unique:true},
  password:{type:String,required:true},
  mobilePhone:{type:String,required:true},
  code:{type:String,default:""},
  lastSeen:{type:Date},
  isLoggedIn:{type:Boolean,default:false},
  isOnline:{type:Boolean,default:false},
  confirmEmail:{type:Boolean,default:false},
  isDeleted:{type:Boolean,default:false}
},{
  timestamps:true
})
export const userModel=mongoose.model('user',userSchema);
