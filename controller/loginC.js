//Logi controller 

const bcrypt = require('bcrypt')
const User = require('../model/userSchema')
const loginC = {}


//displayLogin
loginC.displayLogin = (req,res)=>{
  
  res.render('userLogin',{alert:null})
    
}


//manageLogin
loginC.manageLogin = async (req,res)=>{
  try {
  const{email,password} = req.body  
  const customer = await User.findOne({email})

  if(!customer){
    return res.render('userLogin',{alert:"No user found , Please Sign up"})  //handling if user not exist in db
  }

  req.session.userid = customer._id //storing user id to identify user

  const comparePassword = await bcrypt.compare(password,customer.password)

  //handling if password is wrong
  if(!comparePassword){
    return res.render('userLogin',{alert:"Password is wrong"})
  }
   
  //handling if user is blocked
  if(customer.isBlocked){
    return res.render('userLogin',{alert:"For security reasons, your account has been temporarily blocked. Please contact our support team for assistance in resolving this issue"})
  }

  req.session.userActive = true
  res.redirect('/products')
}catch (error) {
    res.render('userLogin',{alert:"An error occured please try again"})
    console.log(error.message);
  }
  
}






module.exports = loginC