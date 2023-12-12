// Admin Products Panel Controller
const ProductsC = {}
const categoriesdb = require('../model/categorySchema')
const productsdb = require('../model/productSchema')
const multer = require('multer')
const mongoose = require('mongoose')
const {ObjectId} = require('mongoose').Types
const path = require('path')


//Displaying admin product management page
ProductsC.displayPro = async (req,res) =>{
       if(req.session.adminActive){
        const products = await productsdb.find().populate('category')
        console.log(products);
        res.render("adminProducts",{alert:null,products})
       }else{
        res.redirect('/admin')
       }
}

//displaying add product page
ProductsC.displayAddPro = async (req,res) =>{
    try {
        if(req.session.adminActive){
            const categories = await categoriesdb.find()
            res.render("addProduct",{alert:null,categories})
           }else{
            res.redirect('/admin')
           }
    } catch (error) {
        console.log("Error in fetching data",error.message);
        res.status(500).send("Internal Server Error")
    }
}

const storage = multer.diskStorage({
  destination: (req,res,cb) =>{
    cb(null,"public/productimgs") //location of storing images
  },
  filename: (req,file,cb) =>{
    console.log(file);
    cb(null,Date.now() + path.extname(file.originalname)) //Gives unique names to files with the extension name from path
  }
})

ProductsC.upload = multer({
    storage:storage,
    limits:{fieldSize:5*1024*1024} //5MB is the max size
})


//posting product data to db
ProductsC.manageAddPro = async (req,res) =>{
      const {name,category,description,stock,stocks,price,discount} = req.body
      const existingPro = await productsdb.findOne({name})

console.log('req.body:', req.body);
console.log('req.files:', req.files); //uploaded files

      if(existingPro){
        res.render('addProduct',{alert:"Product with this name already exists"})
      }

      try {
    var categoryName = await categoriesdb.findOne({name:category})
    var categoryID = categoryName._id
      console.log(categoryID);
      } catch (error) {
       console.log("An error occured while converting category to ObjectID",error.message);
       return res.render("addProduct",{alert:"Error converting category to ObjectID"})
      }
 
      //Checking if the category id exist
      if(!mongoose.Types.ObjectId.isValid(categoryID)){
        console.log("An error occured not valid categoryID",categoryID);
        return res.render("addProduct",{alert:"Invalid Category"})
      }

try {
        let  mainImage = req.files['mainimage'][0].path // Store the path of the main image
        let  additionalImages = req.files['additionalimage'].map(file => file.path) // Store paths of additional images
        let quantity = new Array()
        if(category === "Outfits"){
          const sizes = ["S","M","L","XL"]
          for (let i = 0; i < sizes.length; i++) {
            quantity.push({
              size: sizes[i],
              stock: stocks[i],
            });
            console.log(sizes[i])
            console.log(stocks[i]);
          }
        }else{
          quantity.push({
            stock:stock
          })
        }
          const newProduct = new productsdb({
                name:name,
                category:categoryID,
                description:description,
                price:price,
                discount:discount,
                quantity:quantity,
                mainimage:mainImage,
                additionalimages:additionalImages,
          })
       const productSave = await newProduct.save()
       await categoriesdb.findOneAndUpdate(
         {_id:categoryID},
         {$push:{products:productSave._id}},
         {new:true}
       )
       res.redirect('/admin/products')
        
      } catch (error) {
        console.log("An error occured",error.message);
        res.status(500).send("Internal Server Error")
      }

}


// Edit products
ProductsC.displayEditPro = async (req,res) =>{
  if(req.session.adminActive){
      const id = req.params.id
      const categories = await categoriesdb.find()
      let product = await productsdb.findById(id).populate('category')
      res.render('editProduct',{alert:null,product,categories})
  }else{
    res.redirect('/admin')
  }
}

ProductsC.manageEditPro = async (req,res) =>{
  try {
    const productId = req.params.id;
    const { name, category, description, stock, stocks, price, discount } = req.body;

    let updateFields = {};

    if (name !== undefined && name !== "") updateFields.name = name;
    if (description !== undefined && description !== "") updateFields.description = description;
    if (price !== undefined && price !== "") updateFields.price = price;
    if (discount !== undefined && discount !== "") updateFields.discount = discount;

    if (category) {
        const categoryName = await categoriesdb.findOne({ name: category });
        const categoryID = categoryName._id;
        updateFields.category = categoryID;
    }
    console.log(stocks);
    if (stock || (stocks && Array.isArray(stocks) && stocks.length > 0)) {
        let quantity = [];
        if (category === "Outfits" && Array.isArray(stocks) && stocks.length > 0) {
            const sizes = ["S", "M", "L", "XL"];
            for (let i = 0; i < stocks.length && sizes.length; i++) {
                quantity.push({
                    size: sizes[i],
                    stock: stocks[i],
                });
            }
        } else {
            quantity.push({
                stock: stock,
            });
        }
        updateFields.quantity = quantity;
        console.log(updateFields.quantity);
    }

    if (req.files['mainimage'] && req.files['mainimage'][0]) {
        updateFields.mainimage = req.files['mainimage'][0].path;
    }

    if (req.files['additionalimage']) {
        updateFields.additionalimages = req.files['additionalimage'].map(file => file.path);
    }

    const updateProduct = await productsdb.findByIdAndUpdate(productId, { $set: updateFields });

    if (updateProduct) {
        res.redirect('/admin/products');
    }

} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
}

}



//Products restrict
ProductsC.manageTogglePro = async (req,res) =>{
  try {
    const id = req.params.id
    const product = await productsdb.findById(id)
    if(product){
       product.isPublished = !product.isPublished
       await product.save()
       res.redirect('/admin/products')
    }else{
       res.status(404).send("Product not found error")
    }
 } catch (error) {
    console.log("An error occured",error.message);
    res.status(500).send("Internal Server Error")
 }
}

// Delete product
ProductsC.removePro = async (req,res) =>{
  try {
    const productId = req.params.id
    await productsdb.findByIdAndDelete(productId)
    res.redirect('/admin/products')
  } catch (error) {
    res.status(500).send("Internal Server Error")
    console.log(error.message);
  }
}












module.exports = ProductsC