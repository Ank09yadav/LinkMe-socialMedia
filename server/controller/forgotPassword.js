const sendEmail = require('../helpers/SendEmail');
const User = require('../models/userModel');
const Otp = require('../models/otp.model');

 const generateOTP= ()=>{
    let otp = "";
    for(let i =0 ; i<6;i++){
      otp+=String(Math.floor(Math.random()*10));
    }
    return otp;
  }
  
  const sendOTP = async (req,res)=>{
    const {email}=req.body
    const user = await User.findOne({email});
    const otp = generateOTP()
    const otpExpiry= new Date(Date.now+10*60*1000);

  }

  const otp=new Otp({
    otp,
    otpExpiry
  })


  const saved = await otp.save();

  const emailResult = await sendEmail( email,'LinkMe'   ,` You otp is`,`<h2> ${otp}</h2>` )
  if(!emailResult.success){
    return res.status(400).json("failed to send otp")
  }
  res.status(200).json(successlly)