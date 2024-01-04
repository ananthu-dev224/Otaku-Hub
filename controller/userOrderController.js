const usersdb = require('../model/userSchema')
const cartdb = require('../model/cartSchema')
const productsdb = require('../model/productSchema')
const ordersdb = require('../model/ordersSchema')
const userOrder = {}

// Place Order
userOrder.placeOrder = async (req,res) =>{
    try {
        const {
            paymentMethod,
            addressId} = req.body;
        // console.log(paymentMethod,addressId);
        if(!addressId){
            return res.json({status:'error',message:'Please add an address'})
        }
        const userId = req.userId;
        const user = await usersdb.findById(userId)
        const cart = await cartdb.findOne({userId:userId}).populate('products.productId')
        const addressToShip = user.address.find((address) => address._id.toString() === addressId.toString()) 
        let products = cart.products
        cart.total = products.reduce((total,product)=>{
         return total + product.total;
        },0);
        const grandTotal = cart.total

        // address saving in order details
        const shippingAddress = {
            name:user.name,
            mobile:user.phonenumber,
            houseaddress:addressToShip.houseaddress,
            street:addressToShip.street,
            city:addressToShip.city,
            pincode:addressToShip.pincode,
            state:addressToShip.state
        }
        
        // order document
        const newOrder = new ordersdb({
            userId:userId,
            totalAmount:grandTotal,
            paymentMethod:paymentMethod,
            products:cart.products,
            address:shippingAddress,
        })

        const orderPlaced = await newOrder.save();

        // Reduce the stock
        let stockToReduce
        for (const product of cart.products) {
            if(product.size !== null){
                stockToReduce = product.productId.quantity.find((entry) => entry.size === product.size);
                   if (stockToReduce) {
                    stockToReduce.stock -= product.quantity;
                    await product.productId.save();
                    console.log("stock reduced in product with size",stockToReduce.stock);
                      }else{
                        console.log('Cannot get the stock for size present products');
                      }
            }else{
                stockToReduce = product.productId.quantity[0]
                if (stockToReduce) {
                    stockToReduce.stock -= product.quantity;
                    await product.productId.save();
                    console.log("stock reduced in product without size",stockToReduce.stock);
                      }else{
                        console.log('Cannot get the stock for  products without size');
                      }
            }
        };
    
        // Cash on Delivery
        if(orderPlaced.paymentMethod === 'COD'){
            cart.products = []
            await cart.save()  //Clear the cart and save
            req.session.isCheckout = false;
            res.json({status:'COD',placedOrderId:orderPlaced._id})             
        }
       
    } catch (error) {
        res.json({status:'error',message:'An error occured while placing order please try again'})
        console.log("An error occured while placing order",error.message);
    }
}
                
// Orders
userOrder.displayOrders = async (req,res) =>{
    try {
        const userId = req.userId
        const userOrders = await ordersdb.find({userId:userId}) //finding the orders a user placed
        res.render('orders',{userOrders})
    } catch (error) {
        console.log("An error occured while displaying orders",error.message);
        res.render('error')
    }
}

// Order Details , single order
userOrder.displaySingleOrder = async (req,res) =>{
    try {
       const orderId = req.query.orderId;
       const orderDetails = await ordersdb.findById(orderId).populate('products.productId')
       res.render('single-order',{orderDetails}) 
    } catch (error) {
        console.log("An error occured while displaying single order",error.message);
        res.render('error') 
    }
}

// Cancel Order
userOrder.cancelOrder = async (req,res) =>{
    try {
      const orderId = req.query.orderId;
      const order = await ordersdb.findById(orderId)
      if(order.orderStatus !== 'Delivered'){
        order.orderStatus = "Cancelled"
        await order.save()
        res.json({status:'success',message:"Order Cancelled successfully"})
      }else{
        res.json({status:'error',message:'Order already Delivered'})  
      }
    } catch (error) {
        console.log("An error occured while cancelling single order",error.message);
        res.json({status:'error',message:'An error occured while cancelling order Please Try Again'})  
    }
}

module.exports = userOrder