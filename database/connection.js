import mongoose from 'mongoose';
export const connection =() =>{
  mongoose.set("strictQuery",true);
  mongoose.connect(process.env.DB_Connection).then(()=>{
    console.log("Connected to MongoDB.");
  }).catch((err)=>{
    console.log("ERROR!!!!!",err);
  });
}
