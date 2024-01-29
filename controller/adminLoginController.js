// Admin Login and Logout controller

const jwt = require('jsonwebtoken')
const Admin = require('../model/adminSchema')
const bcrypt = require('bcrypt')
const admLoginC = {}



// displayadminLogin
admLoginC.displayadminLogin = async (req,res) =>{
try {
      if(!req.session.adminActive){
        res.render('adminlogin')
      }else{
        res.redirect('/dashboard')
      }
} catch (error) {
       res.render('error')
       console.log("An error occured while loading admin login page",error.message);
     }
     }
    

// manageadminLogin
admLoginC.manageadminLogin = async (req,res) =>{
    try {
        const{email,password} = req.body
        
        const dbAdmin = await Admin.findOne({email})

        if(!dbAdmin){
          return  res.json({status:'error',message:'Please provide admin email'})
        }

       const dbPass = await bcrypt.compare(password,dbAdmin.password)

       if(!dbPass){
          return  res.json({status:'error',message:'Please check the password again'})
        }
        req.session.adminActive = true
        // Generate a JWT
        const tokenadmin = jwt.sign({ adminId: dbAdmin._id }, process.env.SECRET_ID_ADMIN, { expiresIn: '1h' });
        // Set the token in a cookie
        res.cookie('tokenadmin', tokenadmin, { httpOnly: true, secure: false });
        res.json({status:'success'}) //to admin dashboard
    } catch (error) {
      res.json({status:'error',message:'An error occured please try again'})
      console.log("error occured at admin login manage",error.message);
    }

}

// manage admin logout
admLoginC.manageadminLogout = (req,res) =>{
 try {
  req.session.adminActive = false
  res.clearCookie('tokenadmin');
  res.redirect('/admin')
 } catch (error) {
  console.log("An error occcured while admin logout",error.message);
  res.render('error')
 }
}





module.exports = admLoginC