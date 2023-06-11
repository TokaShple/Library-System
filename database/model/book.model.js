import mongoose from "mongoose";
const bookSchema=mongoose.Schema({
  title:String,
  issuedUser:{
    type:mongoose.Types.ObjectId,
    ref:'user'
  },
  issued:{
    type:Boolean,
    default:false
  },
  dateIssued:{
    type:String,
    default:null
  },
  dateReturned:{
    type:String,
    default:null
  },
  dayDelay:Number,
  fine:{
    type:Number,
    default:0
  }
},{
  timestamps:true
})
export const bookModel=mongoose.model('book',bookSchema);

