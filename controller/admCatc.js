// Admin Management of Categories

const CategoryC = {}
const categories = require('../model/categorySchema')
const products = require('../model/productSchema')

//displaying category page in admin panel
CategoryC.displayCat = async(req,res) =>{
   try {
     if(req.admin){
         const category = await categories.find()
          res.render('adminCategory',{alert:null,category})
         }else{
          res.redirect('/admin')
     }
   } catch (error) {
      console.log("An error occured while displaying category page",error.message);
   }
}

//displaying add category page in admin panel
CategoryC.displayCatAdd = (req,res) =>{
   try {
      if(req.admin){
         res.render('addCategory',{alert:null})
        }else{
         res.redirect('/admin')
      }
   } catch (error) {
      console.log("An error occured while displaying Add category page",error.message);
   }
}

//posting category add in db
CategoryC.manageCatAdd = async(req,res) =>{
   const {name} = req.body
   const existingCat = await categories.findOne({name})
   if(existingCat){
      res.render('addCategory',{alert:"Category already exists"})
   }
   try {
      const newCat = new categories({
         name,
      })
      await newCat.save()
      res.redirect('/admin/categories')
   } catch (error) {
      res.status(500).send("Internal Server Error")
      console.log("An error occured",error.message);
   }
   
}

//displaying edit category page
CategoryC.displayCatEdit = async (req,res)=>{
  try {
   if(req.admin){
      const id = req.params.id 
      const category = await categories.findById(id)
      res.render('editCategory',{alert:null,category})
   }else{
      res.redirect('/admin')
   }   
  } catch (error) {
   console.log("An error occured while displaying category edit page",error.message);
  }
}

//posting edited category name
CategoryC.manageCatEdit = async (req,res)=>{
   const {name} = req.body
   const id = req.params.id
   const category = await categories.findById(id)
   const existingCat = await categories.findOne({name})
   if(existingCat){
     return res.render("editCategory",{alert:"Category already exists",category})
   }
   try {
      await categories.findByIdAndUpdate(id, { name:name }, { new: true })
           res.redirect('/admin/categories')
   } catch (error) {
      res.status(500).send("Internal Server Error")
      console.log("An error occured",error.message);
   }
}

// Publish and Unpublish category
CategoryC.manageToggleCat = async (req,res) =>{
   try {
      const id = req.params.id
      const category = await categories.findById(id)
      if(category){
         category.isPublished = !category.isPublished
         await category.save()
         res.redirect('/admin/categories')
      }else{
         res.status(404).send("Category not found error")
      }
   } catch (error) {
      console.log("An error occured",error.message);
      res.status(500).send("Internal Server Error")
   }
}

module.exports = CategoryC