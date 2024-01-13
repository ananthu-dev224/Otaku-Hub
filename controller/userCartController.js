const productsdb = require('../model/productSchema')
const usersdb = require('../model/userSchema')
const cartdb = require('../model/cartSchema')
const walletdb = require('../model/walletSchema')
const mongoose = require('mongoose')
const userCart = {}


// Cart page displaying
userCart.displayCart = async (req, res) => {
  try {
    let userId = req.userId
    let cart = await cartdb.find({ userId: userId }).populate('products.productId')
    let products
    if (!cart || cart.length === 0) {
      // If user has no cart, create a new cart
      let newCart = new cartdb({ userId: userId, products: [] });
      await newCart.save();
      cart = [newCart]; // Wrap the new cart in an array for consistency
    }

    // Now, check if products are available
    if (cart[0].products && cart[0].products.length > 0) {
      products = cart[0].products;

      // Calculate the total cart value
      cart[0].total = products.reduce((total, product) => {
        return total + product.total;
      }, 0);

      totalCart = cart[0].total;
    } else {
      products = [];
      totalCart = 0;
    }
    req.session.isCheckout = true
    res.render('cart', { products, totalCart })
  } catch (error) {
    console.log("An error occured while displaying cart page", error.message);
  }
}

// Add to cart
userCart.manageAddToCart = async (req, res) => {
  try {
    const userId = req.userId
    const productId = req.query.productId
    let cart = await cartdb.findOne({ userId: userId })
    if (!cart) {
      let newCart = new cartdb({ userId: userId, products: [] }) // If user has no cart
      await newCart.save()
      cart = newCart
    }

    let productInCart;
    let quantity;
    if (cart.products.length > 0) {
      productInCart = cart.products.find((product) => product.productId._id.toString() === productId.toString())
      if (productInCart) {
        console.log("product is", productInCart);
        quantity = productInCart.quantity;
        console.log("quantity is", quantity);
      }
    }


    const product = await productsdb.findById(productId).populate('category')
    if (!product.isPublished) {
      return res.json({ status: 'published', message: 'Currently the product is not available' })
    }
    let size
    if (product.category.name === 'Outfits') {  // If product is a Outfit
      size = req.query.size
      let selectedSizeStock = product.quantity.find(entry => entry.size === size);
      selectedSizeStock = selectedSizeStock.stock
      if (selectedSizeStock <= 0 || selectedSizeStock <= quantity) {
        return res.json({ status: 'outofstock', message: "Currently the item is Out of Stock" })
      }
    } else { // If product is from other Category
      selectedSizeStock = product.quantity[0].stock
      if (selectedSizeStock <= 0 || selectedSizeStock <= quantity) {
        return res.json({ status: 'outofstock', message: "Currently the item is Out of Stock" })
      }
    }

    // Calculate the final price, considering the discount
    let finalPrice = product.price;
    if (product.discount && product.discount > 0) {
      const discountAmount = Math.floor(product.price - (product.price * (product.discount / 100))); // If product has discount
      finalPrice = discountAmount;
    }

    const existingProductIndex = cart.products.findIndex(
      p => p.productId.toString() === productId && (product.category.name !== 'Outfits' || p.size === size)
    );

    if (existingProductIndex !== -1) {
      // Update the quantity and total of the existing product in the cart
      cart.products[existingProductIndex].quantity += 1;
      cart.products[existingProductIndex].total += finalPrice; // Increase the total amount
    } else {
      // Add the selected product to the cart with the final price
      const cartProduct = {
        productId: productId,
        size: size,
        quantity: 1,
        total: finalPrice * 1, //quantity is 1 bcz it is not an exisiting product in cart
      };

      // Add the new product to the cart
      cart.products.push(cartProduct);
    }

    // Update the cart in the database
    await cart.save();
    res.json({ status: 'success', message: "Product added to the cart successfully" });
  } catch (error) {
    console.log("An error occured while adding product to cart", error.message);
    res.json({ message: "An error occured please try again" })
  }
}


//  Remove Product from cart
userCart.manageRemoveProduct = async (req, res) => {
  try {
    const userId = req.userId
    const productIdRemove = req.query.productId
    const cart = await cartdb.findOne({ userId: userId }).populate('products.productId')
    // console.log("cart is ", cart);
    // console.log("Prodcutobj id", productIdRemove);
    const productIndexToRemove = cart.products.findIndex(product => product.productId._id.toString() === productIdRemove);

    // If the product is found, remove it
    if (productIndexToRemove !== -1) {
      cart.products.splice(productIndexToRemove, 1);

      // Save the updated cart
      await cart.save();
      res.json({ status: 'success' });
    } else {
      res.json({ status: 'error', message: 'Product not found in the cart' });
    }
  } catch (error) {
    console.log("An error occured while removing product from cart", error.message);
    res.json({ message: "An error occured please try again" })
  }
}


// Increase and Decrease Quantity
userCart.updateQuantity = async (req, res) => {
  try {
    const userId = req.userId
    const productId = req.body.proId
    const count = req.body.count;
    const currentValue = req.body.currentValue;
    console.log(count, currentValue);

    const cart = await cartdb.findOne({ userId: userId }).populate('products.productId'); //cart
    const productToUpdate = cart.products.find(product => product.productId._id.toString() === productId.toString()); // product to update quantity

    let stock;
    if (productToUpdate && productToUpdate.size) {
      stock = getProductStock(productToUpdate, productToUpdate.size) // if product is an outfit
      console.log(stock);
    } else {
      stock = productToUpdate.productId.quantity[0].stock
      console.log(stock);
    }
    if (stock < currentValue) {
      res.json({ status: 'error', message: 'Out of Stock' });
    } else {
      const cart = await cartdb.findOneAndUpdate(
        {
          userId: userId,
          'products.productId': productId
        },
        {
          $inc:
            { 'products.$.quantity': count }
        },
        { new: true }
      ).populate('products.productId');

      // Update total 
      const updateProduct = cart.products.find(product => product.productId._id.equals(productId))
      let finalPrice
      if (updateProduct.productId.discount) {
        finalPrice = Math.floor(updateProduct.productId.price - (updateProduct.productId.price * updateProduct.productId.discount / 100))
      } else {
        finalPrice = updateProduct.productId.price
      }
      updateProduct.total = finalPrice * updateProduct.quantity;
      await cart.save()

      // Finding the cart total items count


      res.json({ status: 'success', message: 'Quantity Updated' });
    }
  } catch (error) {
    console.log("An error occured while updating quantity", error.message);
    res.json({ status: 'error', message: 'An error occured while updating quantity' })
  }
}



// Checking stock function 
function getProductStock(cartProduct, productSizeInCart) {
  if (productSizeInCart) {
    let selectedSizeStock = cartProduct.productId.quantity.find(entry => entry.size === productSizeInCart);
    selectedSizeStock = selectedSizeStock.stock
    return selectedSizeStock
  } else {
    selectedSizeStock = cartProduct.productId.stock
    return selectedSizeStock
  }
}

// Use this function to check stock when proceed to checkout as well as place order in checkout
userCart.manageStock = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await cartdb.findOne({ userId: userId }).populate('products.productId');
    const products = cart.products || [];


    let unpublishedProducts = []; // Store names of unpublished products
    let outOfStockProducts = []; // Store names of out-of-stock products


    // Check stock and product published status for each product in the cart
    for (const cartProduct of products) {
      const product = cartProduct.productId;
      console.log("Cart product", product);
      const quantityInCart = cartProduct.quantity;
      console.log("quantity of product", quantityInCart);

      // Check if the product is published
      if (!product.isPublished) {
        // Check if the product name is not already in the unpublishedProducts array
        const isAlreadyAdded = unpublishedProducts.some(item => item.name === product.name);
        if (!isAlreadyAdded) {
          unpublishedProducts.push({
            name: product.name,
          });
          console.log("Product unpublished", product.name);
          continue; // Skip further checks for unpublished products
        }
      }
      // Check if the product has a size property
      if (cartProduct.size) {
        const availableStock = getProductStock(cartProduct, cartProduct.size);
        console.log("available stock", availableStock);
        console.log("Product size ", cartProduct.size);
        if (quantityInCart > availableStock) {
          outOfStockProducts.push({
            name: product.name,
            size: cartProduct.size,
          });
          console.log("Product with size outofstock", product.name);
        }
      } else {
        // For products without size, assume there is a single stock value for the entire product
        const availableStock = cartProduct.productId.quantity[0].stock
        console.log("available stock", availableStock);
        if (quantityInCart > availableStock) {
          outOfStockProducts.push({
            name: product.name,
            size: null,
          });
          console.log("Product without size outofstock", product.name);
        }
      }
    }

    // If there are products with unpublished products, display an alert
    if (cart.products.length === 0) {
      alertMessage = "Cart is Empty"
      console.log(alertMessage);
      return res.json({ status: 'error', message: alertMessage })
    } else if (unpublishedProducts.length === cart.products.length) {
      alertMessage = "All products in the cart are not available"
      console.log(alertMessage);
      return res.json({ status: 'error', message: alertMessage })
    } else if (outOfStockProducts.length === cart.products.length) {
      alertMessage = 'All products in cart are out of stock'
      console.log(alertMessage);
      return res.json({ status: 'error', message: alertMessage })
    } else if (outOfStockProducts.length > 0) {
      alertMessage = ` Remove the following out-of-stock products from your cart: ${outOfStockProducts
        .map(item => (item.size ? `${item.name} (Size: ${item.size})` : item.name))
        .join(', ')}`;
      console.log(alertMessage);
      return res.json({ status: 'error', message: alertMessage })
    } else if (unpublishedProducts.length > 0) {
      let alertMessage = ` Remove the following unavailable products from your cart: ${unpublishedProducts
        .map(item => item.name).join(', ')}`;
      console.log(alertMessage);
      return res.json({ status: 'error', message: alertMessage })
    } else {
      console.log("Displaying checkout page");
      return res.json({ status: 'success' })
    }
  } catch (error) {
    console.log("An error occurred while checking stock and published status", error.message);
    res.json({ status: 'error', message: 'An error occured please try again' })
  }
};


// Proceed to Checkout
userCart.displayCheckout = async (req, res) => {
  try {
    if (req.session.isCheckout) {
      const userId = req.userId
      const user = await usersdb.findById(userId)
      const cart = await cartdb.findOne({ userId: userId }).populate('products.productId')
      let products = cart.products
      cart.total = products.reduce((total, product) => {
        return total + product.total;
      }, 0);
      const grandTotal = cart.total
      let wallet = await walletdb.findOne({ userId: userId })
      if (!wallet) {
        wallet = new walletdb({ userId: userId })
        await wallet.save()
      }
      res.render('checkout', { user, products, grandTotal, wallet })
    } else {
      res.redirect('/cart')
    }
  } catch (error) {
    console.log("An error occured while loading checkout page", error.message);
  }
}





module.exports = userCart