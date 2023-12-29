const usersdb = require('../model/userSchema')
const cartdb = require('../model/cartSchema')
const productsdb = require('../model/productSchema')
const userOrder = {}

// Place Order
userOrder.placeOrder = async (req,res) =>{
    try {
        console.log("Entered into place order route");
    } catch (error) {
        console.log("An error occured while placing order");
    }
}
                   
// Orders




// Order Details , single order




module.exports = userOrder