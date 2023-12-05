//Admin Dashboard controller

const admDashC = {}






//displayadminDash
admDashC.displayadminDash = (req,res) =>{
    if(req.session.adminActive){
        res.render('adminPanel',{alert:null})
    }else{
        res.redirect('/admin/login')
    }
}







module.exports = admDashC