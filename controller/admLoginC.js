// Admin login controller


const Admin = require('../model/adminSchema')
const bcrypt = require('bcrypt')
const admLoginC = {}



// displayadminLogin
admLoginC.displayadminLogin = async (req,res) =>{
    if(!req.session.adminActive){
        res.render('adminlogin',{alert:null})
    }else{
        res.redirect('/admin')    //if there is session then redirect to admin panel
    }
    }
    

// manageadminLogin
admLoginC.manageadminLogin = async (req,res) =>{
    try {
        const{email,password} = req.body
        const dbAdmin = await Admin.findOne({email})

        const dbPass = await bcrypt.compare(password,dbAdmin.password)
        if(!dbAdmin){
          return  res.render('adminlogin',{alert:"Admin email not found"})
        }else if(!dbPass){
          return  res.render('adminlogin',{alert:"Please check the password again"})
        }
        req.session.adminActive = true
        res.redirect('/admin')  //to admin dashboard
    } catch (error) {
      console.log("error occured",error.message);
    }

}














module.exports = admLoginC