// Product display in User side
const userPro = {}
const categoriesdb = require('../model/categorySchema')
const productsdb = require('../model/productSchema')


// All products page
userPro.displayPro = async (req,res) =>{
   if(req.session.userActive){
   try {
    let categories = await categoriesdb.find()
    let products = await productsdb.find().populate('category')
    res.render('products',{categories,products})
   } catch (error) {
    res.status(500).send("Internal Server Error")
    console.log(error.message);
   }
   }else{
    res.redirect('/login')
   }
}

//Products displaying category vise
userPro.displayCat = async (req,res) =>{
    if(req.session.userActive){
        try {
         const name = req.params.category
         let categories = await categoriesdb.find().populate('products')
         let category = await categoriesdb.findOne({name:name,isPublished:true}).populate('products') 
         res.render('categoryPro',{categories,category})
        } catch (error) {
         res.status(500).send("Internal Server Error")
         console.log(error.message);
        }
        }else{
         res.redirect('/login')
    }
} 

userPro.displayView = async (req,res) =>{
    if(req.session.userActive){
        try {
         const id = req.params.id
         let product = await productsdb.findById(id).populate('category')
         let categories = await categoriesdb.find()
         res.render('viewProduct',{categories,product})
        } catch (error) {
         res.status(500).send("Internal Server Error")
         console.log(error.message);
        }
        }else{
         res.redirect('/login')
    }
}





















module.exports = userPro