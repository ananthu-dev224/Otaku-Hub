//Controller for view users and other functions


const User = require('../model/userSchema')
const admUsersC ={}


admUsersC.displayUsers = async  (req,res)=>{
    try {
          if(req.session.adminActive){
          const users = await User.find()
          res.render('customers',{users,alert:null})
            
        }else{
            res.redirect('/admin/login')
        }

    } catch (error) {
      console.log('An error occured',error.message) 
      res.status(500).send("Internel Server Error")
    }
}


admUsersC.blockUser = async(req,res) =>{
    try {
        const id = req.params.id
        const customer = await User.findById(id) 
        if(!customer){
            res.status(404).send("User not found , Server Error")
        }
        customer.isBlocked = !customer.isBlocked  //switches the state of whether the customer is blocked or not
        await customer.save()
        res.redirect('/admin/view-users')
        
    } catch (error) {
        res.status(500).send('Internal Server Error')
        console.log("Error occured",error.message);
    }
}



admUsersC.unblockUser = async(req,res)=>{
    try {
        const id = req.params.id
    const customer = await User.findById(id)
    if(!customer){
        res.status(404).send('User not found,Server Error')
    }

    customer.isBlocked = !customer.isBlocked //switches the state of whether the customer is blocked or not
    await customer.save()
    res.redirect('/admin/view-users')
    } catch (error) {
        res.status(500).send("Internal Server Error",error.message) 
    }

}

admUsersC.searchUser = async (req,res )=>{
    const {name} = req.query

    if(!name){
        res.redirect('/admin/view-users')
    }
    try{
        const regex = new RegExp (`^${name}.*`, 'i');
        const users = await User.find({name:regex})
        res.render('customers',{users,alert:null})
    }catch(err){
        console.log(err.message);
        res.status(404).send("Internal Server Error")
    }
}
































module.exports = admUsersC