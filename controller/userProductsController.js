// Product display in User side
const userPro = {}
const categoriesdb = require('../model/categorySchema')
const productsdb = require('../model/productSchema')
const usersdb = require('../model/userSchema')
const cartdb = require('../model/cartSchema')
const bcrypt = require('bcrypt')


// All products page
userPro.displayPro = async (req,res) =>{
   try {
    let categories = await categoriesdb.find()
    let products = await productsdb.find().populate('category')
    res.render('all-products',{categories,products})
   } catch (error) {
    res.status(500).send("Internal Server Error")
    console.log("An error occured while loading all products",error.message);
   }
}

//Products displaying category vise
userPro.displayCat = async (req,res) =>{
        try {
         const name = req.query.name
         let categories = await categoriesdb.find().populate('products')
         let category = await categoriesdb.findOne({name:name,isPublished:true})
         let id = category._id
         let products = await productsdb.find({category:id,isPublished:true}).populate('category')
         res.render('all-products',{categories,products})
        } catch (error) {
         res.status(500).send("Internal Server Error")
         console.log("An error occured while loading category products",error.message);
        }
} 

userPro.displayView = async (req,res) =>{
        try {
         const id = req.params.id
         let product = await productsdb.findById(id).populate('category')
         let categories = await categoriesdb.find()
         if(product.isPublished){
            res.render('single-product',{categories,product})
         }else{
            res.redirect('/products')
         }
        } catch (error) {
         res.status(500).send("Internal Server Error")
         console.log(error.message);
        }
}

userPro.filterPro = async (req,res) =>{
 try {
  const categories = await categoriesdb.find()
  let order = req.query.order
  let filteredPro
  if(order === 'low'){
    filteredPro = await productsdb.find().populate('category').sort({price:1})
  }else{
    filteredPro = await productsdb.find().populate('category').sort({price:-1})
  }
  res.render('all-products',{categories,products:filteredPro})
 } catch (error) {
  res.status(500).send("Internal Server Error")
  console.log("An error occured while sorting",error.message);
 }
}


//Search Products
userPro.displaySearch = async (req,res) =>{
  try {
    const {name} = req.query

    if(!name){
      res.redirect('/products')
  }
    const escapedText = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp (escapedText, 'i');
    const products = await productsdb.find({name:regex}).populate('category')
    const categories = await categoriesdb.find();
    res.render('all-products',{products,categories})
 } catch (error) {
    res.status(500).send("Internal Server Error")
    console.log(error.message);
 }
}


userPro.displayProfile = async (req,res) =>{
    try {
      const id = req.userId
      const user = await usersdb.findById(id)
      res.render('userProfile',{user})
    } catch (error) {
      res.status(500).send("Internal Server Error")
      console.log("Error occured while loading profile",error.message);
    }
}


userPro.editProfile = async (req,res) => {
    try {
      const {name,email,number,userId} = req.body;
      console.log(number);
      const usersData = await usersdb.find();

     // Finding other users to check whether email and phone number already exists
      const existingUsers = usersData.filter(user=>user._id.toString() !== userId);
      const emailExists = existingUsers.filter(user=>user.email === email);
      
      if(emailExists.length){
         res.json({status:'error',message:'Email Already Exists'});
      }else{
         const user = await usersdb.findByIdAndUpdate(userId,
            {$set:{
               name:name,
               phonenumber:number,
            }},
            {new:true});
         res.json({status:'success',message:'Profile Edited Successfully'});

    }
   } catch (error) {
      console.log("An error occured while editing profile",error.message);
      res.json({status:'error',message:'An error occured please try again'});
    }
}

// Change user password at profile
userPro.changePass = async (req,res) =>{
   try {
      const {currentPassword , newPassword ,confirmNewPassword, userId} = req.body
      const userData =  await usersdb.findById(userId)
      const userPassword = userData.password
      const comparePasswordCurrent = await bcrypt.compare(currentPassword,userPassword) // checking if current password and the password in db are same
      const comparePasswordNew = await bcrypt.compare(newPassword,userPassword) // checking if newpassword is same as old one
      if(currentPassword === '' || newPassword === ''){
         return res.json({status:'error',message:"Password should not be blank"})
      }else
       if(!comparePasswordCurrent){
         return res.json({status:'error',message:"Your current password is wrong"})
      }else if(newPassword !== confirmNewPassword){
         return res.json({status:'error',message:"New password and confirm password is not same "})
      }
      else if(comparePasswordNew){
         return res.json({status:'error',message:"Your new password cannot be the same as your current password"})
      }else{
         const saltRounds = 10
         const hashedNew = await bcrypt.hash(newPassword,saltRounds)
        userData.password = hashedNew
        await userData.save()
        res.json({status:"success",message:"Password Changed Successfully"})
      }
   } catch (error) {
      console.log("An error occured while changing password",error.message);
      res.status(500).send("Internal Server Error")
   }
}


// Manage address page
userPro.displayManageAddress = async (req,res) =>{
   try {
      const userId = req.userId
      console.log("User id in address page",userId);
      const user = await usersdb.findById(userId)
      res.render('userAddress',{user})
   } catch (error) {
      console.log("An error occured while loading manage address",error.message);
   }
}


// Add address
userPro.manageAddAddress = async (req,res) =>{
   try {
      const{houseaddress,street,city,pincode,state} = req.body
      const userId = req.userId
      console.log("User id in add address",userId);
      const user = await usersdb.findById(userId)
      const userAddress = user.address
      
      const newAddress = {
         houseaddress:houseaddress,
         street:street,
         city:city,
         pincode:pincode,
         state:state,
      }

      if(userAddress.length >= 5){
         return res.json({status:'error',message:"Maximum Address limit reached"})
      }
      
      
    const matchingAddresses = new Array()
    for (let i = 0; i < userAddress.length; i++) {
  const userPincode = userAddress[i].pincode.toString().trim();
  const inputPincode = pincode.toString().trim();
  if (
    userAddress[i].houseaddress === houseaddress &&
    userAddress[i].street === street &&
    userAddress[i].city === city &&
    userPincode  === inputPincode &&
    userAddress[i].state === state
  ) {
    matchingAddresses.push(userAddress[i]);
  }
}

      if(matchingAddresses.length > 0){
        return res.json({status:'error',message:"Same address already exists"})
      }
      console.log("Exisiting address is :",matchingAddresses);

      // Push new address 
      user.address.push(newAddress);
      await user.save();
      res.json({status:'success',message:'Address added successfully'})

   } catch (error) {
      res.json({status:'error',message:"An error occured while adding address"})
      console.log("An error occured while adding address",error.message);
   }
}

// Edit address page
userPro.displayEditAddress = async (req,res) =>{
   try {
      const userId = req.userId
      const addressId = req.params.id
      const user = await usersdb.findById(userId)
      const address = user.address.find((address) => address._id.toString() === addressId);
   if(!address){
   res.json({status:'error',message:'Address not found , please try again'})
   }
   res.render('userEditAddress',{address})
   } catch (error) {
      res.render('error')
      console.log("An error occured while loading edit address page",error.message);
   }
}




// Edit exisiting address
userPro.manageEditAddress = async (req,res) =>{
   try {
     const userId = req.userId
     const {addressId,houseaddress,street,state,city,pincode} = req.body
     const user = await usersdb.findById(userId)
     const userAddress = user.address

   const address = user.address.find((address) => address._id.toString() === addressId);
   if(!address){
      res.json({status:'error',message:'Address not found , please try again'})
   }

 const matchingAddresses = userAddress.filter(
   (userAddr) =>
     userAddr.houseaddress === houseaddress &&
     userAddr.street === street &&
     userAddr.city === city &&
     userAddr.pincode.toString().trim() === pincode.toString().trim() &&
     userAddr.state === state &&
     userAddr._id.toString() !== addressId // Exclude the current address being edited
 );

     console.log("Exisiting address is :",matchingAddresses);
     if(matchingAddresses.length > 0){
       return res.json({status:'error',message:"Same address already exists"})
     }else{
      address.houseaddress=houseaddress
      address.street=street
      address.state=state
      address.city=city
      address.pincode=pincode
        
      await user.save();
   
      res.json({status:'success',message:'Address edited successfully'})
     }
   } catch (error) {
     console.log("An error occured while submitting edit address",error.message);
   }
}

// Address delete
userPro.manageDeleteAddress = async (req,res) =>{
   try {
      const addressId = req.params.id
      const userId = req.userId
      const user = await usersdb.findById(userId)
      console.log("User document in delete address",user);
       // Find the index of the address with the ID
       const addressIndex = user.address.findIndex((address) => address._id.toString() === addressId);
       // Check if the address with the specified ID exists
       if (addressIndex === -1) {
         return res.status(404).json({ status: 'error', message: 'Address not found' });
       }
      console.log("Address index is",addressIndex);
      user.address.splice(addressIndex, 1); // Modifying address array
      await user.save();
    res.json({status:'success',message:'Address deleted successfully'})
   } catch (error) {
      console.log("An error occured while deleting address",error.message);
      res.json({status:'error',message:'An error occured while deleting address, Please try again'})
   }
}




// User logout 
userPro.logoutUser = async (req,res)=>{
  try {
     req.session.userActive = false
     res.clearCookie('token');
     res.redirect('/login');
  } catch (error) {
     res.render('error')
     console.log(error.message)
  }
}









module.exports = userPro