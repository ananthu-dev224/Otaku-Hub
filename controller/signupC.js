//Sign up Route Controlling using OTP Verification

const User = require('../model/userSchema')
const otpgenerator = require('generate-otp')
const nodemailer = require('nodemailer')
const bcrypt =  require('bcrypt')
const jwt = require('jsonwebtoken')
const signupC = {}

//displaySignup
signupC.displaySignup = (req,res)=>{
    try {
    if(!req.session.userActive){
        res.render('signUp',{alert:null})
    }else{
        res.redirect('/home')
          } 
    } catch (error) {
        res.send("Internal Server Error")
        console.log("An error occured while displaying signup page",error.message);
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




//manageSignup
signupC.manageSignup = async (req,res)=>{
        const{name,email,phonenumber,password,confirmpassword} = req.body
        const duplicateuser =  await User.findOne({email})

        if(duplicateuser){
          return  res.render('signUp',{alert:"Email already exists"}) //if email already exist in db
        }
        
        //generate otp
        const otpln = 6
        const otp = otpgenerator.generate(otpln,{digits:true,lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false})
        const expireOtp = 5 * 60 * 1000 //5 minute in milliseconds

        if(password !== confirmpassword){
           return res.render('signUp',{alert:"Password is not correct"})
        }

        //store signup data temporary in session
        req.session.data =({
            name,
            email,
            phonenumber,
            password,
            otp,
            timestamp:Date.now(),
            expireOtp
        })
   

        try{
            await mail(email,otp) //calling mail function and sending otp through mail
            req.session.isSignup =  true
            res.redirect('/otp-verification')
    
     } catch (error) {
        console.log("Error occured",error.message)
     }
}



//displayOtp
signupC.displayOtp = (req,res)=>{
    try {
        if(req.session.isSignup){
            res.render('verification',{alert:null})
        }else{
            res.redirect('/signup') 
        }
    } catch (error) {
        console.log("An error occured while loading otp page",error.message);
    }
}



//manageOtp
signupC.manageOtp = async (req,res) =>{
    const {enteredOtp } = req.body
    const userData = req.session.data
    const {otp , expireOtp , timestamp}= userData
    //expire the otp
    const isExpired = Date.now() - timestamp > expireOtp
    if(isExpired){
        res.render('signUp',{alert:'Otp has been expired'})
        return
    }

// verifying the otp entered by user and the otp that has sent
    if(enteredOtp === otp){
         
        const saltrounds = 10
        const hashedpassword = await bcrypt.hash(userData.password,saltrounds)


       const newUser = new User({
          name: userData.name,
           email: userData.email,
           phonenumber: userData.phonenumber,
           password:hashedpassword,
       })
 
       try {

        const storeUser = await newUser.save()

        //create session variables
        req.session.userActive = true
        

     //clear the session 
        delete req.session.data
        delete req.session.isSignup
     // Generate a JWT
        const token = jwt.sign({ userId: storeUser._id }, process.env.SECRET_ID, { expiresIn: '24h' });
     // Set the token in a cookie
        console.log(token);
       res.cookie('token', token, { httpOnly: true, secure: false });
       res.redirect('/home')

       } catch (error) {
          console.log("error occured :",error.message);
          res.render('signUp',{alert:"An error occured please try again"})
       }


    }else{
        res.render('verification',{alert:"Otp is not correct"})
    }
}





//resentOtp
signupC.resentOtp = async(req,res) =>{
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
    res.redirect('/otp-verification')
 } catch (error) {
   res.status(500).send("Internal Server Error")
   console.log("Error occured",error.message);
    
 }
}


module.exports = signupC

