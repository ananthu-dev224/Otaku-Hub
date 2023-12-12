//Admin Dashboard controller

const admDashC = {}






//displayadminDash
admDashC.displayadminDash = (req,res) =>{
    try {
        if(req.session.adminActive){
            res.render('adminPanel',{alert:null})
        }else{
            res.status(200).redirect('/admin')
        }
    } catch (error) {
        console.log(error);
    }
}







module.exports = admDashC