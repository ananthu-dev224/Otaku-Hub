//Admin Dashboard controller

const admDashC = {}

//displayadminDash
admDashC.displayadminDash = (req,res) =>{
    try { 
        res.render('adminPanel',{alert:null})
    } catch (error) {
        console.log("An error occured while loading admin dashboard",error.message);
    }
}


module.exports = admDashC