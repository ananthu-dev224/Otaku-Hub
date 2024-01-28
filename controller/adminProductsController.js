// Admin Products Panel Controller
const ProductsC = {}
const categoriesdb = require('../model/categorySchema')
const productsdb = require('../model/productSchema')
const multer = require('multer')
const mongoose = require('mongoose')
const { ObjectId } = require('mongoose').Types
const path = require('path')
let categoryName;
let categoryID;


//Displaying admin product management page
ProductsC.displayPro = async (req, res) => {
  try {
    const perPage = 4; // Number of products per page
    const currentPage = parseInt(req.query.page) || 1; // Get the page from the query parameter, default to 1

    const totalProducts = await productsdb.countDocuments({});
    const totalPages = Math.ceil(totalProducts / perPage);

    const products = await productsdb.find().populate('category')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .exec();

    res.render("adminProducts", { products, currentPage, totalPages, search: null });

  } catch (error) {
    console.log("An error occured while loading product management page", error.message);
    res.render('error')
  }
}

// Search Product
ProductsC.searchProduct = async (req, res) => {
  try {
    const perPage = 4; // Number of products per page
    const currentPage = parseInt(req.query.page) || 1; // Get the page from the query parameter, default to 1

    const { name } = req.query;
    const regex = new RegExp(name, 'i');

    const totalProducts = await productsdb.countDocuments({ name: { $regex: regex } });
    const totalPages = Math.ceil(totalProducts / perPage);

    const products = await productsdb.find({ name: { $regex: regex } })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .exec();

    res.render("adminProducts", { products, currentPage, totalPages, search: name });

  } catch (error) {
    console.log("An error occured while searching product", error.message);
    res.render('error')
  }
}




//displaying add product page
ProductsC.displayAddPro = async (req, res) => {
  try {
    const categories = await categoriesdb.find()
    res.render("addProduct", { categories, alert: null })
  } catch (error) {
    console.log("An error occured while displaying add products page", error.message);
    res.render('error')
  }
}

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "public/productimgs") //location of storing images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)) //Gives unique names to files with the extension name from path
  }
})

ProductsC.upload = multer({
  storage: storage,
  limits: { fieldSize: 5 * 1024 * 1024 } //5MB is the max size
})


//posting product data to db
ProductsC.manageAddPro = async (req, res) => {
  const { name, category, description, stock, stocks, price, discount } = req.body
  const categories = await categoriesdb.find()
  const existingPro = await productsdb.findOne({
    $or: [
      { name: name }, // Case-sensitive check for the exact name
      { name: { $regex: new RegExp('^' + name + '$', 'i') } }, // Case-insensitive check
    ]
  });

  if (existingPro) {
    res.render("addProduct", { alert: 'Product with this name already exists', categories })
  }

  try {
    categoryName = await categoriesdb.findOne({ name: category })
    categoryID = categoryName._id

  } catch (error) {
    console.log("An error occured while converting category to ObjectID", error.message);
    return res.render("addProduct", { alert: "Error converting category to ObjectID", categories })
  }

  //Checking if the category id exist
  if (!mongoose.Types.ObjectId.isValid(categoryID)) {
    console.log("An error occured not valid categoryID", categoryID);
    return res.render("addProduct", { alert: "Invalid Category", categories })
  }

  try {
    let mainImage = req.files['mainimage'][0].path // Store the path of the main image
    let additionalImages = req.files['additionalimage'].map(file => file.path) // Store paths of additional images
    let quantity = new Array()
    if (category === "Outfits") {
      const sizes = ["S", "M", "L", "XL"]
      for (let i = 0; i < sizes.length; i++) {
        quantity.push({
          size: sizes[i],
          stock: stocks[i],
        });
      }
    } else {
      quantity.push({
        stock: stock
      })
    }
    const newProduct = new productsdb({
      name: name,
      category: categoryID,
      description: description,
      price: price,
      discount: discount,
      quantity: quantity,
      mainimage: mainImage,
      additionalimages: additionalImages,
    })
    const productSave = await newProduct.save()
    await categoriesdb.findOneAndUpdate(
      { _id: categoryID },
      { $push: { products: productSave._id } },
      { new: true }
    )
    res.redirect('/admin/products')

  } catch (error) {
    console.log("An error occured while adding product", error.message);
    res.render('error')
  }

}


// Edit products
ProductsC.displayEditPro = async (req, res) => {
  try {
    const id = req.params.id
    const categories = await categoriesdb.find()
    let product = await productsdb.findById(id).populate('category')
    res.render('editProduct', { product, categories })
  } catch (error) {
    console.log("An error occured while displaying edit products page", error.message);
    res.render('error')
  }
}


// Edit product submit
ProductsC.manageEditPro = async (req, res) => {
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
    console.log("An error occured while managing edit product", error.message);
    res.render('error')
  }

}



//Products restrict
ProductsC.manageTogglePro = async (req, res) => {
  try {
    const id = req.params.id
    const product = await productsdb.findById(id)
    if (product) {
      product.isPublished = !product.isPublished
      await product.save()
      res.redirect('/admin/products')
    } else {
      console.log("product not found error when toggling");
      res.render('error')
    }
  } catch (error) {
    console.log("An error occured while toggling product", error.message);
    res.render('error')
  }
}

// Delete product
ProductsC.removePro = async (req, res) => {
  try {
    const productId = req.params.id
    await productsdb.findByIdAndDelete(productId)
    res.redirect('/admin/products')
  } catch (error) {
    console.log("An error occured while removing product", error.message);
    res.render('error')
  }
}




module.exports = ProductsC