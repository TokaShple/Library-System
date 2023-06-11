import express from 'express';
import {connection} from './database/connection.js';
import * as dotenv from 'dotenv';
import AppError from './utlis/AppError.js';
import userRouter from './src/module/user/user.router.js';
import bookRouter from './src/module/book/book.router.js';
dotenv.config();
const app = express();
const port = 3000;
connection();
app.use(express.json());
app.use(userRouter);
app.use(bookRouter);
app.get('/favicon.ico', (req, res) => res.status(204));
app.all('*',(req,res,next)=>{
    next (new AppError(`Can't find this route: ${req.originalUrl}`,404));
})
app.use((err,req,res,next)=>{
    console.log(err);
    const status = err.status || 500;
    res.status(status);
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
