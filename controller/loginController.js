//Login controller 

const bcrypt = require('bcrypt')
const User = require('../model/userSchema')
const productsDb = require('../model/productSchema')
const walletdb = require('../model/walletSchema')
const razorpayHelper = require('../helpers/razorpayHelper')
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


// display wallet
loginC.displayWallet = async (req,res) =>{
  try {
    const userId = req.userId;
    let userWallet = await walletdb.findOne({userId:userId})
    if(!userWallet){
        userWallet = new walletdb({userId:userId})
        await userWallet.save()
    }
    res.render("wallet",{userWallet})
  } catch (error) {
    console.log("An error occured while displaying wallet page",error.message);
    res.render('error')
  }
}

// Recharge wallet amount
loginC.rechargeWallet = async(req,res) =>{
  try {
    let {amount} = req.body;
    amount = Number(amount)
    const orderId = ""+Date.now()
   
    razorpayHelper.generatePaymentOrder(orderId,amount).then((response) => {
      res.json({status:'Razorpay',response})
    })

  } catch (error) {
    console.log("An error occured while recharging wallet",error.message);
    res.render('error')
  }
}

// Clear transaction history
loginC.clearHistory = async (req,res) =>{
  try {
    const userId = req.userId;
    const wallet = await walletdb.findOne({userId:userId})
    if(wallet.transactionHistory.length === 0){
      return res.json({status:'error',message:'Nothing to clear'})
    }else{
      wallet.transactionHistory = [];
      await wallet.save()
      res.json({status:'success',message:'Transaction history cleared'})
    }
  } catch (error) {
    console.log("An error occured while clearing transaction history");
    res.json({status:'failed',message:'An error occured please try again'})
  }
}





module.exports = loginC