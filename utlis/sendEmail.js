import nodemailer from 'nodemailer';
export const emailFunction=async(email,subject,html)=>{
  let transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
      user:process.env.Email_Sender,
      pass:process.env.Password_Sender,
    },
  });
  let info=await transporter.sendMail({
    from:process.env.Email_Sender,
    to:email,
    subject,
    html,
  });
  console.log("Done.....");
}
