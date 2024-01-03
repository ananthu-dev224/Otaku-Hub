//Controller for forgot password for user

const forgotC = {}
const User = require('../model/userSchema')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const otpgenerator = require('generate-otp')


forgotC.displayForgot = (req,res)=>{
   try {
    res.render('forgotpass')
   } catch (error) {
    res.render('error')
    console.log("An error occured while loading forgotpass page",error.message);
   }
}

//function for sending otp
async function mail(email,otp){
    const Transporter = nodemailer.createTransport({
        secure:true,
        service:'gmail',
        auth:{
            user:"otakuhubkl@gmail.com",
            pass:"tezt mtsd jdrh sfaf"
        }
    })
    //html template 
    const html =`
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href=""style="font-size:1.4em;color: red;text-decoration:none;font-weight:600">Otaku Hub</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Otaku Hub. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
    <h2 style="background: red;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />Otaku Hub</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Otaku Hub Inc</p>
      <p>Terms and Privacy</p>
      <p>Kerala,India</p>
    </div>
  </div>
</div>
    `

    //email data
    const content = {
        from:"Otakuhubkl@gmail.com",
        to:email,
        subject:"Otp verification",
        html:html
    }
    const info = await Transporter.sendMail(content)
    console.log(info);
}


//sending otp through mail after getting valid email
forgotC.manageForgot = async (req,res) =>{
    req.session.isForgot = false
    const {email} = req.body
    const user = await User.findOne({email:email})
    if(!user){
       return res.json({status:'error',message:'Enter the email registered for your account'})
    }
        //generate otp
        const otpln = 6
        const otp = otpgenerator.generate(otpln,{digits:true,lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false})
        const expireOtp = 5 * 60 * 1000 //5 minute in milliseconds
        
        // store as temporary to access in verify otp page
        req.session.data = ({
            email,
            otp,
            expireOtp,
            timestamp:Date.now()
        })
        
    
    
    try {
        await mail(email,otp)
        req.session.isForgot = true //to check whether email  is sent
        res.json({status:'success',message:'Otp sent to your email'})   
    } catch (error) {
        res.json({status:'error',message:'An error occured please try again'})
        console.log("An error occured in sending otp at forgot password",error.message);
    }

}

//verification of otp
forgotC.displayOtp = (req,res) =>{
   try {
    if(req.session.isForgot){
        res.render('forgotVerify',{alert:null})
    }else{
        res.redirect('/forgot-password')
    }
   } catch (error) {
    res.render('error')
    console.log("An error occured while loading otp page",error.message);
   }
}


forgotC.manageOtp = (req,res) =>{
    req.session.isVerify = false //to check whether verification is complete
    const {enteredOtp} = req.body
    const data = req.session.data
    const {otp , expireOtp , timestamp}= data
    //Check if otp expired
    const isExpired = Date.now() - timestamp > expireOtp
    if(enteredOtp !== otp){
        res.json({status:'error',message:'OTP is wrong'})
    }
    if(isExpired){
        res.json({message:'OTP has been expired'})
    }
try {
    // Checking both otp is correct
    if(enteredOtp === otp){
        req.session.isVerify = true
        res.json({status:'success',message:'OTP verified successfully'})
    }
} catch (error) {
    console.log("An error occured",error.message);
    res.json({status:'error',message:'An error occured please try again'})
}
}

//resentOtp
forgotC.resentOtp = async(req,res) =>{
    try {
        const data = req.session.data
        const email = data.email
        //generate otp
        const otpln = 6
        const otpNew = otpgenerator.generate(otpln,{digits:true,lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false})
        const expireOtpNew = 5 * 60 * 1000 //5 minute in milliseconds
   
        //store signup data temporary in session
        req.session.data.otp = otpNew
        req.session.data.expireOtp = expireOtpNew
        req.session.data.timestamp = Date.now()
       await mail(email,otpNew) //calling mail function and sending otp through mail
       req.session.isForgot = true
       res.redirect('/forgot-password/verify')
    } catch (error) {
      console.log("Error occured during resent otp at forgot password",error.message);
      res.render('error') 
    }
   }


// new password patching
forgotC.displayNew = (req,res) =>{
    try {
        if(req.session.isVerify){
            res.render('newPassword')
        }else{
            res.redirect('/forgot-password')
        }   
    } catch (error) {
        console.log("An error occured while displaying new password page",error.message);
        res.render('error')
    }
}

forgotC.manageNew = async (req,res) =>{
    const {password,confirmpassword} = req.body
    const email = req.session.data.email
    const user = await User.findOne({email:email})
    if(password !== confirmpassword){
        return res.json({status:'error',message:'Password is not matching'})
    }
    try {
        if(password === confirmpassword){
            const saltrounds = 10
            const hashedPassword = await bcrypt.hash(password,saltrounds)
            user.password = hashedPassword
            await user.save()
            delete req.session.data
            res.json({status:'success',message:'Password changed successfully'})
        }
    } catch (error) {
        console.log("An error occured",error.message);
        res.json({status:'error',message:'An error occured please try again'})
    }
   
}




module.exports = forgotC


