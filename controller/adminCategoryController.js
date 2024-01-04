// Admin Management of Categories

const CategoryC = {}
const categories = require('../model/categorySchema')
const products = require('../model/productSchema')

//displaying category page in admin panel
CategoryC.displayCat = async(req,res) =>{
   try {
         const category = await categories.find()
         res.render('adminCategory',{alert:null,category})
   } catch (error) {
      console.log("An error occured while displaying category page",error.message);
      res.render('error')
   }
}

//displaying add category page in admin panel
CategoryC.displayCatAdd = (req,res) =>{
   try {
       res.render('addCategory')
   } catch (error) {
      console.log("An error occured while displaying Add category page",error.message);
      res.render('error')
   }
}

//posting category add in db
CategoryC.manageCatAdd = async(req,res) =>{
   const {name} = req.body
   const existingCat = await categories.findOne({
      $or: [
          { name: name }, // Case-sensitive check for the exact name
          { name: { $regex: new RegExp('^' + name + '$', 'i') } }, // Case-insensitive check
      ]
  });
   if(existingCat){
      return res.json({status:'error',message:'Category already exists'})
   }
   try {
      const newCat = new categories({
         name,
      })
      await newCat.save()
      res.json({status:'success',message:'Category added successfully'})
   } catch (error) {
      console.log("An error occured",error.message);
      res.json({status:'error',message:'An error occured please try again'})
   }
   
}

//displaying edit category page
CategoryC.displayCatEdit = async (req,res)=>{
  try {
      const id = req.params.id 
      const category = await categories.findById(id)
      res.render('editCategory',{category})
  } catch (error) {
   console.log("An error occured while displaying category edit page",error.message);
   res.render('error')
  }
}

//posting edited category name
CategoryC.manageCatEdit = async (req,res)=>{
   const {name,id} = req.body
   const existingCat = await categories.findOne({
      $or: [
          { name: name }, // Case-sensitive check for the exact name
          { name: { $regex: new RegExp('^' + name + '$', 'i') } }, // Case-insensitive check
      ]
  });
   if(existingCat){
     return res.json({status:'error',message:'Category Already Exists'})
   }
   try {
      await categories.findByIdAndUpdate(id, { name:name }, { new: true })
      res.json({status:'success',message:'Category Updated Successfully'})
   } catch (error) {
      console.log("An error occured",error.message);
      res.json({status:'error',message:'An error occured please try again'})
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
      res.render('error')
   }
}

module.exports = CategoryC