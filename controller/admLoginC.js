// Admin Login and Logout controller


const Admin = require('../model/adminSchema')
const bcrypt = require('bcrypt')
const admLoginC = {}



// displayadminLogin
admLoginC.displayadminLogin = async (req,res) =>{
      if(!req.session.adminActive){

        res.render('adminlogin',{alert:null})

      }else{
        res.redirect('/dashboard')
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
        res.redirect('/dashboard')  //to admin dashboard
    } catch (error) {
      console.log("error occured",error.message);
    }

}

// manage admin logout
admLoginC.manageadminLogout = (req,res) =>{
  req.session.adminActive = false
  res.redirect('/admin')
}












module.exports = admLoginC