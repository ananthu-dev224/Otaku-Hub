const usersdb = require('../model/userSchema')
const cartdb = require('../model/cartSchema')
const productsdb = require('../model/productSchema')
const ordersdb = require('../model/ordersSchema')
const walletdb = require('../model/walletSchema')
const razorpayHelper = require('../helpers/razorpayHelper')
const userOrder = {}



// Place Order
userOrder.placeOrder = async (req, res) => {
  try {
    const {
      paymentMethod,
      addressId } = req.body;

    if (!addressId) {
      return res.json({ status: 'error', message: 'Please add an address' })
    }
    const userId = req.userId;
    const user = await usersdb.findById(userId)
    const cart = await cartdb.findOne({ userId: userId }).populate('products.productId')
    const addressToShip = user.address.find((address) => address._id.toString() === addressId.toString())
    let products = cart.products
    cart.total = products.reduce((total, product) => {
      return total + product.total;
    }, 0);
    const grandTotal = cart.total

    // address saving in order details
    const shippingAddress = {
      name: user.name,
      mobile: user.phonenumber,
      houseaddress: addressToShip.houseaddress,
      street: addressToShip.street,
      city: addressToShip.city,
      pincode: addressToShip.pincode,
      state: addressToShip.state
    }

    // order document
    const newOrder = new ordersdb({
      userId: userId,
      totalAmount: grandTotal,
      paymentMethod: paymentMethod,
      products: cart.products,
      address: shippingAddress,
    })




    // Cash on Delivery
    if (paymentMethod === 'COD') {
      // Reduce the stock
      let stockToReduce
      for (const product of cart.products) {
        if (product.size !== null) {
          stockToReduce = product.productId.quantity.find((entry) => entry.size === product.size);
          if (stockToReduce) {
            stockToReduce.stock -= product.quantity;
            await product.productId.save();
            console.log("stock reduced in product with size", stockToReduce.stock);
          } else {
            console.log('Cannot get the stock for size present products');
          }
        } else {
          stockToReduce = product.productId.quantity[0]
          if (stockToReduce) {
            stockToReduce.stock -= product.quantity;
            await product.productId.save();
            console.log("stock reduced in product without size", stockToReduce.stock);
          } else {
            console.log('Cannot get the stock for  products without size');
          }
        }
      };
      cart.products = []
      await cart.save()  //Clear the cart and save
      req.session.isCheckout = false;
      let orderPlaced = await newOrder.save();
      res.json({ status: 'COD', placedOrderId: orderPlaced._id })
    }


    // Razorpay
    if (paymentMethod === 'Razorpay') {
      let placedOrder = await newOrder.save()
      placedOrder.orderStatus = 'Failed' // if the payment is successfull this status is changed
      await placedOrder.save()
      const orderId = placedOrder._id;
      const total = grandTotal;
      razorpayHelper.generatePaymentOrder(orderId, total).then((response) => { // creating order 
        res.json({ status: "Razorpay", response })
      })
    }


    // Wallet
    if (paymentMethod === 'Wallet') {
      ;
      let wallet = await walletdb.findOne({ userId: userId })

      if (!wallet) {
        wallet = new walletdb({ userId: userId })
        await wallet.save()
      }

      const amount = wallet.amount // amount in user wallet
      const totalInAmount = grandTotal;

      if (amount < totalInAmount) {
        return res.json({ status: 'error', message: 'You have no sufficient amount in your wallet' })
      } else {
        wallet.amount = amount - totalInAmount;
        const transaction = (-1 * grandTotal);
        wallet.transactionHistory.push(transaction) // recent transaction as debit in history
        await wallet.save();
        orderPlaced = await newOrder.save();
        console.log("Wallet after transaction", wallet);


        // Reduce the stock
        let stockToReduce
        for (const product of cart.products) {
          if (product.size !== null) {
            stockToReduce = product.productId.quantity.find((entry) => entry.size === product.size);
            if (stockToReduce) {
              stockToReduce.stock -= product.quantity;
              await product.productId.save();
              console.log("stock reduced in product with size", stockToReduce.stock);
            } else {
              console.log('Cannot get the stock for size present products');
            }
          } else {
            stockToReduce = product.productId.quantity[0]
            if (stockToReduce) {
              stockToReduce.stock -= product.quantity;
              await product.productId.save();
              console.log("stock reduced in product without size", stockToReduce.stock);
            } else {
              console.log('Cannot get the stock for  products without size');
            }
          }
        };
        // Clearing the cart and reducing the product quantity
        cart.products = []
        await cart.save()  //Clear the cart and save
        orderPlaced = await newOrder.save();
        req.session.isCheckout = false;
        return res.json({ status: 'Wallet', placedOrderId: orderPlaced._id })
      }
    }

  } catch (error) {
    res.json({ status: 'error', message: 'An error occured while placing order please try again' })
    console.log("An error occured while placing order", error.message);
  }
}

// Verify the Online payment from Razorpay and Update the payment status
userOrder.verifyPaymentAndStatus = async (req, res) => {
  console.log("Entered into verify payment route");
  const userId = req.userId;
  const data = req.body;
  const receipt = data.order.receipt;
  const cart = await cartdb.findOne({ userId: userId }).populate('products.productId')

  razorpayHelper.verifyOnlinePayment(data).then(() => {
    console.log("Resolved verifyOnlinePayment from helper");

    if (data.from === 'Wallet') {  // so we have to recharge money to wallet
      const amount = (data.order.amount) / 100 // converting paise to inr 
      walletdb.findOneAndUpdate({ userId: userId }, { $inc: { amount: amount }, $push: { transactionHistory: amount } }, { new: true }).then((isUpdated) => {
        console.log("Wallet recharged ", isUpdated);
        res.json({ status: 'rechargeSuccess', message: 'Wallet Updated' });
      }).catch((err) => {
        console.log("Wallet not recharged", err.message);
        res.json({ status: 'error', message: 'An error occured, Wallet not updated' });
      })
    } else { // so it is direct payment from razorpay
      let paymentSuccess = true;
      const updateStock = async () => { //if the payment is success only the cart is updating as empty and clearing stock
        // Reduce the stock
        let stockToReduce
        for (const product of cart.products) {
          if (product.size !== null) {
            stockToReduce = product.productId.quantity.find((entry) => entry.size === product.size);
            if (stockToReduce) {
              stockToReduce.stock -= product.quantity;
              await product.productId.save();
              console.log("stock reduced in product with size", stockToReduce.stock);
            } else {
              console.log('Cannot get the stock for size present products');
            }
          } else {
            stockToReduce = product.productId.quantity[0]
            if (stockToReduce) {
              stockToReduce.stock -= product.quantity;
              await product.productId.save();
              console.log("stock reduced in product without size", stockToReduce.stock);
            } else {
              console.log('Cannot get the stock for  products without size');
            }
          }
        };

        // Clearing the cart and reducing the product quantity
        cart.products = []
        await cart.save()  //Clear the cart and save
      }
      updateStock();
      req.session.isCheckout = false;
      razorpayHelper.updatePaymentStatus(receipt, paymentSuccess).then(() => {
        console.log("updated payment success of razorpay online payment");
        res.json({ status: "paymentSuccess", placedOrderId: receipt })
      })
    }
  }).catch((error) => {
    console.log("Rejected verifyOnlinePayment from helper", error.message);
    let paymentSuccess = false;
    razorpayHelper.updatePaymentStatus(receipt, paymentSuccess).then(() => {
      console.log("updated payment failure of razorpay online payment")
      res.json({ status: "paymentFailed", placedOrderId: receipt })
    })
  })

}


// Orders
userOrder.displayOrders = async (req, res) => {
  try {
    const userId = req.userId
    const userOrders = await ordersdb.find({ userId: userId }) //finding the orders a user placed
    res.render('orders', { userOrders })
  } catch (error) {
    console.log("An error occured while displaying orders", error.message);
    res.render('error')
  }
}

// Order Details , single order
userOrder.displaySingleOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const orderDetails = await ordersdb.findById(orderId).populate('products.productId')
    res.render('single-order', { orderDetails })
  } catch (error) {
    console.log("An error occured while displaying single order", error.message);
    res.render('error')
  }
}

// Cancel Order
userOrder.cancelOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const orderId = req.query.orderId;
    const order = await ordersdb.findById(orderId).populate('products.productId')
    if (order.orderStatus !== 'Delivered') {
      order.orderStatus = "Cancelled"

      // If order cancelled put the stock back
      let stockToIncrease
      for (const product of order.products) {
        if (product.size !== null) {
          stockToIncrease = product.productId.quantity.find((entry) => entry.size === product.size);
          if (stockToIncrease) {
            stockToIncrease.stock += product.quantity;
            await product.productId.save();
            console.log("stock added back in product with size", stockToIncrease.stock);
          } else {
            console.log('Cannot get the stock for size present products');
          }
        } else {
          stockToIncrease = product.productId.quantity[0]
          if (stockToIncrease) {
            stockToIncrease.stock += product.quantity;
            await product.productId.save();
            console.log("stock added back in product without size", stockToIncrease.stock);
          } else {
            console.log('Cannot get the stock for  products without size');
          }
        }
      };
      await order.save()
      if (order.paymentMethod !== 'COD') {
        let wallet = await walletdb.findOne({ userId: userId })
        if (!wallet) {
          wallet = new walletdb({ userId: userId })
          await wallet.save()
        }
        const amount = order.totalAmount;
        wallet.amount += amount;
        wallet.transactionHistory.push(amount)
        await wallet.save()
      }
      res.json({ status: 'success', message: "Order Cancelled successfully" })
    } else {
      res.json({ status: 'error', message: 'Order already Delivered' })
    }
  } catch (error) {
    console.log("An error occured while cancelling single order", error.message);
    res.json({ status: 'error', message: 'An error occured while cancelling order Please Try Again' })
  }
}

// Return order request and message
userOrder.returnOrder = async (req, res) => {
  try {
    const {message} = req.body;
    const orderId = req.query.orderId;
    console.log(orderId);
    const order = await ordersdb.findById(orderId)
    console.log(order);
    if(!message){
       return res.json({status:'error',message:'Message is mandatory!'})
    }
    // Check if the order delivered is not exceeded 3 days
    const deliveredDate = new Date(order.deliveredDate)
    console.log(deliveredDate);
    const currentDate = new Date()
    console.log(currentDate);

    // Calculate the difference in milliseconds
     const differenceInMilliseconds = currentDate - deliveredDate;
     console.log(differenceInMilliseconds);

    // Calculate the difference in days
     const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
     console.log(differenceInDays);
     if(differenceInDays > 3){
      return res.json({status:'error',message:'You cant return order , More than 3 Days since delivery'})
     }else{
       order.message = message
       order.orderStatus = "Return requested"
       await order.save()
       return res.json({status:'success',message:'Return request send successfully , you will be notified when admin approve the request'})
     }
  } catch (error) {
    console.log("An error occured while return order request", error.message);
    res.json({ status: 'error',message:'An error occured, we will resolve this issue ASAP!'})
  }
}

// Cancel the return order request
userOrder.cancelRequest = async (req,res) => {
  try {
    const {orderId} = req.query;
    const orderDetails = await ordersdb.findById(orderId);
    orderDetails.message = ''
    orderDetails.orderStatus = 'Request cancelled' 
    await orderDetails.save()
    res.json({status:'success',message:'Return Request cancelled successfully'})
  } catch (error) {
    console.log("An error occured while cancelling return order request", error.message);
    res.json({ status: 'error',message:'An error occured, we will resolve this issue ASAP!'})
  }
}



module.exports = userOrder