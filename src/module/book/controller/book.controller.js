import moment from "moment";
import { bookModel } from "../../../../database/model/book.model.js";
import AppError from "../../../../utlis/AppError.js";
import catchAsyncError from "../../../../utlis/errorHandle.js";

export const addBook =catchAsyncError(async(req,res,next)=>{
  try{
    const {title}=req.body;
    const exist=await bookModel.findOne({title});
    if(exist){
      return next(new AppError("Book Already Exist!!!",400));
    }
    const book=new bookModel({title});
    const saveBook=await book.save();
    !saveBook &&  next(new AppError("Fail to save BOOK!!!"));
    saveBook && res.status(201).json({message:"Book Saved....",saveBook});
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!",err});
  }
})

export const issuedBook =catchAsyncError(async(req,res,next)=>{
  try{
    const{bookId,issuedUser}=req.body;
    const dateIssued=moment().format('MM/DD/YYYY');
    const book=await bookModel.findOneAndUpdate({issued:false,_id:bookId},{issued:true,dateIssued,dateReturned: Date,issuedUser},{new:true});
    !book && next(new AppError("FAIL TO ISSUE BOOK!!!",400));
    book && res.status(200).json({message:"DONE....",book});
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!",err});
  }
})

export const searchBook =catchAsyncError(async(req,res,next)=>{
  try{
    const{title}=req.body;
    const exist=await bookModel.findOne({title});
    !exist &&  next(new AppError("book not found!!!",400));
    exist && res.status(200).json({message:"SUCCESS...",exist});
    }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!",err});
  }
})

export const allBook =catchAsyncError(async(req,res,next)=>{
  try{
    const exist=await bookModel.find({});
    !exist.length &&  next(new AppError("books not found!!!",400));
    exist && res.status(200).json({message:"DONE...",exist});
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!",err});
  }
})

export const allBooksIssued =catchAsyncError(async(req,res,next)=>{
  try{
    const exist=await bookModel.find({issued:true});
    !exist.length &&  next(new AppError("books not found!!!",400));
    exist && res.status(200).json({message:"SUCCESS...",exist});
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!",err});
  }
})

export const issuedBookUser =catchAsyncError(async(req,res,next)=>{
  try{
    const {IssuedUser}=req.body;
    const exist=await bookModel.find({issued:true,IssuedUser});
    !exist.length &&  next(new AppError("book not found!!!",400));
    exist && res.status(200).json({message:"SUCCESS...",exist});
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!",err});
  }
})

export const allNotReturnedBooks =catchAsyncError(async(req,res,next)=>{
  try{
    const books =await bookModel.find({issued:true});
    const nowDate=moment();
    let fineDelay;
    for(const i in books){
      books[i].fine=20;
      fineDelay=nowDate.diff(books[i].dateReturned,'days')*books[i].fine;
      if(fineDelay<0){
        fineDelay=0;
      }
      books[i].fine=fineDelay;
    }
    res.status(200).json({message:"DONE....",books});
  }catch(err){
    console.log(err);
    res.status(500).json({message:"ERROR!!",err});
  }
})
