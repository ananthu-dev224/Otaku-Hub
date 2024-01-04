//Login controller 

const bcrypt = require('bcrypt')
const User = require('../model/userSchema')
let productsDb = require('../model/productSchema')
const jwt = require('jsonwebtoken')
const loginC = {}

//displayLogin
loginC.displayLogin = (req,res)=>{
  try {
    if(req.query.blocked === 'true'){
      res.render('userLogin',{alert:"For security reasons, your account has been temporarily blocked. Please contact our support team for assistance in resolving this issue"})
    }else if(!req.session.userActive ){
      res.render('userLogin')
    }else{
      res.redirect('/home')
    }
  } catch (error) {
    console.log("An error occured while displaying login page",error.message);
    res.render('error')
  } 
}


//manageLogin
loginC.manageLogin = async (req,res)=>{
  try {
  const{email,password} = req.body  
  const customer = await User.findOne({email})

  if(!customer){
    return res.json({status:'error',message:"No user found , Please Sign up"})  //handling if user not exist in db
  }

  console.log(customer._id);
  try {
    const comparePassword = await bcrypt.compare(password, customer.password);
    if (!comparePassword) {
      return res.json({status:'error',message:"Password is wrong"})
    }
 } catch (error) {
    console.error("An error occurred while comparing passwords:", error.message);
    return res.json({status:'error',message:"An error occured please try again"})
 }
   
  //handling if user is blocked
  if(customer.isBlocked){
    return res.json({status:'blocked',message:" For security reasons, your account has been temporarily blocked. Please contact our support team for assistance in resolving this issue"})
  }


  // Generate a JWT
  const token = jwt.sign({ userId: customer._id }, process.env.SECRET_ID, { expiresIn: '24h' });
  // Set the token in a cookie
  console.log(token);
   req.session.userActive = true;

   res.cookie('token', token, { httpOnly: true, secure: false });
   res.json({status:'success'})
  
}catch (error) {
    res.json({status:'error',message:"An error occured please try again"})
    console.log(error.message);
  }
  
}

// Home Page
loginC.displayHome = async (req,res) =>{
   try {
       let allProducts = await productsDb.find()
       let latestProducts = allProducts.sort((a,b) => b._id.getTimestamp() - a._id.getTimestamp()).slice(0,4) //sorted to get the last added products
       res.render('home',{products:latestProducts})
    
   } catch (error) {
    res.render('error')
    console.log(" An error occured while loading home page",error.message);
   }
}




module.exports = loginC