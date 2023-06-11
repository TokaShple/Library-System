import { userModel } from "../../../../database/model/user.model.js";
import {emailFunction} from "../../../../utlis/sendEmail.js";
import catchAsyncError from "../../../../utlis/errorHandle.js";
import bcrypt from "bcryptjs";
import pkg from 'bcryptjs';
import jwt from "jsonwebtoken";
import { json } from "express";
import {nanoid} from "nanoid";
import AppError from "../../../../utlis/AppError.js";
const { hash } = pkg;
const { Jwt } = jwt;
/////////////////////////////////////////////////GET ALL USERS//////////
export const getAllUsers =catchAsyncError(async (req,res)=>{
    try{
    const users=await userModel.find();
    res.status(200).json({message:"Done!",users});
    }catch(err){
    console.log({message:"Error!!!",err})
    }
}) 
////////////////////////////////////////////////////////////////////////////SIGNUP
export const signup=catchAsyncError( async(req,res,next)=>{
  try{
    const{name,email,password,confirmPassword,mobilePhone}=req.body;
    const user=await userModel.findOne({email});
    if(user){
      next (new AppError("USER EXISTS!!!!",400));
    }else{
    const hashPassword=bcrypt.hashSync(password,+process.env.Round);
    const newUser=new userModel({name,email,password:hashPassword,confirmPassword:hashPassword,mobilePhone});
    const savedUser=await newUser.save();
    const token=jwt.sign({email:savedUser.email,id:savedUser._id},process.env.JWT_key);
    const link=`${req.protocol}://${req.headers.host}/user/confirmEmail/${token}`;
    emailFunction(email,"email Confirmation",`<a href='${link}'>email confirmation</a>`);
    if(savedUser){
      res.status(201).json({message:"USER SAVED.....",newUser});
    }else{
      next (new AppError("ERROR IN SIGNUP!!!!",400));
    }
    }
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!!",err});
  }
})
////////////////////////////////////////////////////////////////////////////CONFIRMEMAIL
export const confirmEmail=catchAsyncError( async(req,res,next)=>{
  try{
    const {token}=req.params;
    if(!token){
      return res.status(400).json({message:"invalid token!!!!"});
    }
    const decoded=jwt.verify(token,process.env.JWT_key);
    const user=await userModel.findByIdAndUpdate({_id:decoded.id},{confirmEmail:true},{new:true});
    if(user){
      res.status(201).json({message:"EMAIL CONFIRMED....."});
    }else{
      next (new AppError("FAIL IN EMAIL CONFIRMATION!!!!",400));
    }
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!!",err});
  }
})
////////////////////////////////////////////////////////////////////////////FORGETPASSWORD
export const forgetPassword = catchAsyncError( async(req,res,next)=>{
  try{
    const{email}=req.body;
    const user=await userModel.findOne({email});
    if(!user){
      return next (new AppError("USER NOT FOUND!!!!",404));
    }
    let code=nanoid(4);
    let token;
    if(user){
      token=jwt.sign({email,id:user._id},process.env.JWT_key);
      const link=`${req.protocol}://${req.headers.host}/user/resetPassword/${token}`;
      emailFunction(user.email,"your password verification",`<a href='${link}'>Verify Password</a>`);
      const sendCode= await userModel.findOneAndUpdate({email},{code},{new:true});
      if(sendCode){
        res.status(201).json({message:"PASSWORD VERIFIED....",code,link})
      }else{
        next(new AppError("FAIL TO VERIFY PASSWORD!!!!",400));
      }
    }
}catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!!",err});
  }
})
////////////////////////////////////////////////////////////////////////////RESETPASSWORD
export const resetPassword=catchAsyncError (async(req,res,next)=>{
  try{
    const {token}=req.params;
    const{code,newPassword}=req.body;
    if(!token){
      next(new AppError("INVALID TOKEN!!!!",400));
    }else{
      const decoded=jwt.verify(token,process.env.JWT_key);
      if(!decoded?.id){
        next(new AppError("THERE IS NO ID!!!!",400));
      }else{
        const user=await userModel.findById(decoded._id);
        if(!user){
          next(new AppError("USER NOT FOUND!!!!",400));
        }else{
          const match=bcrypt.compareSync(newPassword,user.password);
          if(match){
            next(new AppError("PASSWORD SAVED AS OLD PASSWORD!!!!"))
          }else{
            if(code==""){
              return next(new AppError("INVALID CODE!!!!",400));
            }else{
              const hashPassword=bcrypt.hashSync(newPassword,+process.env.Round);
              const updated=await userModel.updateOne({code},{password:hashPassword,code:""},{new:true});
              if(updated.modifiedCount){
                res.status(201).json({message:"UPDATED........."});
              }else{
                next(new AppError("Faild to update PASSWORD!!!!",400));
              }
            }
          }
        }
      }
    }
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!!",err});
  }
})
////////////////////////////////////////////////////////////////////////////SIGNIN
export const signin=catchAsyncError(async(req,res,next)=>{
  try{
    const{email,password}=req.body;
    const userExists=await userModel.findOne({email});
    if(!userExists||userExists.isDeleted){
      next(new AppError("INVALID USER!!!!",400));
    }else{
      const match=bcrypt.compareSync(password,userExists.password);
      if(!match){
        next(new AppError("PASSWORD NOT MATCH!!!!",400));
      }else{
        const token=jwt.sign({email:userExists.email,id:userExists._id},process.env.JWT_key);
        const user=await userModel.updateOne({email},{isOnline:true,isLoggedIn:true});
        if(user.modifiedCount){
          res.status(200).json({message:"DONE USER SIGNED IN...",token});
        }else{
          next(new AppError("FAIL TO SIGN IN!!!!",400));
        }
      }
    }
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!!",err});
  }
})
////////////////////////////////////////////////////////////////////////////LOGOUT
export const logout =catchAsyncError(async(req,res,next)=>{
  try{
    const {token} = req.headers;
    const { password } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.id;
    
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid password', 401));
    }
    
    const updatedUser = await userModel.findByIdAndUpdate(userId,{ isOnline:false, isLoggedIn: false, lastSeen: Date.now() },{ new: true });
    if (!updatedUser) {
      return next(new AppError('Failed to logout user', 500));
    }
    res.status(200).json({ message: 'User logged out successfully' });
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!!",err});
  }
})
////////////////////////////////////////////////////////////////////////////SOFTDELETE
export const softDeleted=catchAsyncError(async (req,res,next)=>{
  try{
    const {email}=req.body;
    const userExists=await userModel.findOne({email});
    if(!userExists){
      next(new AppError("USER NOT FOUND!!!!",400));
    }else{
      const deleted=await userModel.findOneAndUpdate({email},{isLoggedIn:false,isDeleted:true});
      if(deleted){
        res.status(200).json({message:"USER DELETED....."});
      }else{
        next(new AppError("FAIL TO DELETE USER!!!!",400));
      }
    }
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!!",err});
  }
})
////////////////////////////////////////////////////////////////////////////UPDATE USER
export const updateUser=catchAsyncError(async(req,res,next)=>{
  try{
    const {token} = req.headers;
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.id;
    const userExists = await userModel.findById(userId);
    if (!userExists) {
      return next(new AppError('User not found', 404));
    }
    let {name,email,password,mobilePhone}=req.body;
    let user=await userModel.findByIdAndUpdate(userId,{name,email,password,mobilePhone},{new:true});
    !user && next (new AppError("Not Found!!!!",404));
    user && res.status(200).json({message:"DONE...",user});
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!",err});
  }
})
