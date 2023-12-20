// Admin Login and Logout controller

const jwt = require('jsonwebtoken')
const Admin = require('../model/adminSchema')
const bcrypt = require('bcrypt')
const admLoginC = {}



// displayadminLogin
admLoginC.displayadminLogin = async (req,res) =>{
try {
      if(!req.session.adminActive){
        res.render('adminlogin',{alert:null})
      }else{
        res.redirect('/dashboard')
      }
} catch (error) {
       console.log("An error occured while loading admin login page",error.message);
     }
     }
    

// manageadminLogin
admLoginC.manageadminLogin = async (req,res) =>{
    try {
        const{email,password} = req.body
        console.log(req.body);
        const dbAdmin = await Admin.findOne({email})

        if(!dbAdmin){
          return  res.render('adminlogin',{alert:"Admin email not found"})
        }

       const dbPass = await bcrypt.compare(password,dbAdmin.password)

       if(!dbPass){
          return  res.render('adminlogin',{alert:"Please check the password again"})
        }
        req.session.adminActive = true
        // Generate a JWT
        const tokenadmin = jwt.sign({ adminId: dbAdmin._id }, process.env.SECRET_ID_ADMIN, { expiresIn: '1h' });
        // Set the token in a cookie
        res.cookie('tokenadmin', tokenadmin, { httpOnly: true, secure: false });
        console.log("Admin JWT",tokenadmin);
        res.redirect('/dashboard')  //to admin dashboard
    } catch (error) {
      console.log("error occured",error.message);
    }

}

// manage admin logout
admLoginC.manageadminLogout = (req,res) =>{
 try {
  req.session.adminActive = false
  res.clearCookie('tokenadmin');
  res.redirect('/admin')
 } catch (error) {
  res.status(500).send('Internal Server Error')
  console.log("An error occcured while admin logout",error.message);
 }
}












module.exports = admLoginC