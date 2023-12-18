// Product display in User side
const userPro = {}
const categoriesdb = require('../model/categorySchema')
const productsdb = require('../model/productSchema')
const usersdb = require('../model/userSchema')


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
         const name = req.params.category
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
         res.render('single-product',{categories,product})
        } catch (error) {
         res.status(500).send("Internal Server Error")
         console.log(error.message);
        }
}

userPro.filterPro = async (req,res) =>{
 try {
  const categories = await categoriesdb.find()
  let order = req.params.order
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
      const usersData = await usersdb.find();

     // Find other Users and find is the email already exist or not
      const existingUser = usersData.filter(user=>user._id.toString() !== userId);
      const emailExists = existingUser.filter(user=>user.email === email);
      const numberExist = existingUser.filter(user=>user.phonenumber.toString() === number);
      
      if(emailExists.length && numberExist.length){
         res.json({status:'error',message:'Email and Mobile Number Already Exists'});
      }else if(emailExists.length){
         res.json({status:'error',message:'Email Already Exists'});
      }else if(numberExist.length){
         res.json({status:'error',message:'Mobile Number Already Exists'});
      }else{
         const user = await usersdb.findByIdAndUpdate(userId,
            {$set:{
               name:name,
               email:email,
               phonenumber:number,
            }},
            {new:true});
         res.json({status:'success',message:'Profile Edited Successfully'});

    }
   } catch (error) {
      console.log("An error occured while editing profile",error.message);
      res.status(500).send("Internal Server Error")
    }
}









// User logout 
userPro.logoutUser = async (req,res)=>{
  try {
     req.session.userActive = false
     res.clearCookie('token');
     res.redirect('/login');
  } catch (error) {
     console.log(error.message)
  }
}









module.exports = userPro