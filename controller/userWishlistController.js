const wishlistdb = require("../model/wishlistSchema")
const cartdb = require('../model/cartSchema')
const productsdb = require('../model/productSchema')
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

// display wishlist page
const displayWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        let cart = await cartdb.findOne({ userId: userId }).populate('products.productId')
        if (!cart) {
            cart = new cartdb({ userId: userId })
            await cart.save()
        }
        const cartCount = cart.products.length
        let wishlist = await wishlistdb.findOne({ userId: userId }).populate('products.productId')
        if (!wishlist) {
            wishlist = new wishlistdb({ userId: userId })
            await wishlist.save()
        }
        const products = wishlist.products
        res.render('wishlist', { cartCount, products })
    } catch (error) {
        res.render('error')
        console.log("An error occured while displaying wishlist page", error.message);
    }
}

// Add to wishlist
const addToWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const productId = req.query.productId;
        const product = await productsdb.findById(productId).populate('category')
        if (!product.category.isPublished) {
            return res.json({ message: 'This category of products is not currently available' })
        }
        let wishlist = await wishlistdb.findOne({ userId: userId })
        if (!wishlist) {
            wishlist = new wishlistdb({ userId: userId })
            await wishlist.save()
        }
        let productInWishlist
        if (wishlist.products.length > 0) {
            productInWishlist = wishlist.products.find((product) => product.productId._id.toString() === productId.toString())
            if (productInWishlist) {
                return res.json({ message: 'Product is already in Wishlist' })
            }
        }
        const wishlistProduct = {
            productId: productId,
        }
        wishlist.products.push(wishlistProduct)
        await wishlist.save()
        res.json({ status: 'success', message: "Product added to WishList" });
    } catch (error) {
        console.log("An error occured while adding product to wishlist", error.message);
        res.render('error')
    }
}

// Remove from wishlist
const removeWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const productObj = req.query.productId

        // Fetch the wishlist document
        const wishlist = await wishlistdb.findOne({ userId: userId }).populate('products.productId')
        const productIndexToRemove = wishlist.products.findIndex(product => product._id.toString() === productObj.toString()); //removing product based on the object id 

        // If the product is found, remove it
        if (productIndexToRemove !== -1) {
            wishlist.products.splice(productIndexToRemove, 1);
            // Save the updated wishlist
            await wishlist.save();
            res.json({ status: 'success', message: 'Product removed from wishlist successfully' });
        } else {
            res.json({ message: 'An error occured, we will solve this issue ASAP' });
        }

    } catch (error) {
        console.log("An error occured while removing from wishlist", error.message);
        res.render("error")
    }
}





module.exports = {
    displayWishlist,
    addToWishlist,
    removeWishlist,
}