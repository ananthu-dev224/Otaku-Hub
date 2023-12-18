//Admin Dashboard controller

const admDashC = {}






//displayadminDash
admDashC.displayadminDash = (req,res) =>{
    try {
        if(req.admin){
            res.render('adminPanel',{alert:null})
        }else{
            res.clearCookie('tokenadmin')
            console.log("An error occured while loading admin dashboard",error.message);
            req.session.adminActive = false
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error);
    }
}







module.exports = admDashC