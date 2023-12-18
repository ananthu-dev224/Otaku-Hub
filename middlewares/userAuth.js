const jwt = require('jsonwebtoken');
let customersdb = require('../model/userSchema')


let verifyToken = (req,res,next) => {
   try {
   // Retrieve the token from the cookie
  const token = req.cookies.token;
  // Check if the token is present
  console.log("User JWT auth",token);
if (!token) {
  return res.status(401).redirect('/login');
}

  // Verify the token
  console.log('Secret Key of User:', process.env.SECRET_ID);
  const user =  jwt.verify(token, process.env.SECRET_ID)
  req.userId = user.userId
  next();

   } catch (error) {
      res.clearCookie('token')
      req.session.userActive = false
      console.log("An error occured while authentication of user",error.message);
      return res.status(401).redirect('/login');
   }
}

const checkBlocked = async (req,res,next) =>{
   try {
       const id = req.userId
       const customer = await customersdb.findById(id)
       console.log(id);
       console.log(customer);
      if(customer.isBlocked){
        req.session.userActive = false
        res.clearCookie('token')
        res.redirect('/login?blocked=true')
      }else{
        next()
      }
   } catch (error) { 
      console.log(error.message);
   }
}




module.exports = {
  verifyToken,
  checkBlocked,
}