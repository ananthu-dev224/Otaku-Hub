const jwt = require('jsonwebtoken');

let verifyTokenAdmin = (req,res,next) => {
   try {
   // Retrieve the token from the cookie
  const tokenadmin = req.cookies.tokenadmin;
if (!tokenadmin) {
  console.log("No token found for admin");
  return res.redirect('/admin')
} else{
// Verify the token
const admin =  jwt.verify(tokenadmin, process.env.SECRET_ID_ADMIN)
req.admin = admin.adminId;
req.session.adminActive = true
next();
}
   } catch (error) {
      res.clearCookie('tokenadmin')
      console.log("An error occured while authentication of admin",error.message);
      req.session.adminActive = false
      res.redirect('/admin')
   }
}



module.exports =  verifyTokenAdmin
