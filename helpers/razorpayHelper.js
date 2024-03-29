const Razorpay = require('razorpay')
const ordersdb = require('../model/ordersSchema')
const crypto = require('crypto')
require('dotenv').config();



const instance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
})



// Creating a new Razorpay Order
const generatePaymentOrder = async (orderId,total) =>{
    return new Promise((resolve,reject)=>{
        var options = {
           amount: total * 100, // in Razorpay amount is in paise so converting it 
           currency:"INR",
           receipt:orderId,
        };
        instance.orders.create(options,function(err,order){ //creating order using Razorpay client 
            if (err) {
                // If there is an error, reject the Promise
                console.error("Error creating Razorpay order:", err);
                reject(err);
              } else {
                // If the order is successfully created, log it and resolve the Promise
                console.log("New order from Razorpay:", order);
                resolve(order)
              }
        }); 
     })
}


const verifyOnlinePayment = async(details)=>{  
    console.log(details) 
    return new Promise((resolve,reject)=>{
       let hmac = crypto.createHmac('sha256',process.env.RAZORPAY_SECRET_KEY); //sha256 algorithm for secure hashing
       hmac.update(details.payment.razorpay_order_id+'|'+details.payment.razorpay_payment_id);
       // Converted to string format
       hmac = hmac.digest('hex');
       // Compare the two hex code that come from the razorpay signature and created hex
       if(hmac == details.payment.razorpay_signature){
          // If it matches we resolve it 
          resolve();
       }else{
          // Doesn't match we reject
          reject();
       }
    })
 }
 
 const updatePaymentStatus = (orderId,paymentStatus)=>{
    return new Promise(async(resolve,reject)=>{
       try {
          if(paymentStatus === true){
             await ordersdb.findByIdAndUpdate({_id:new Object(orderId)},{$set:{orderStatus:'Pending'}})
             .then(()=>{
                resolve();
             });
          }else{
             await ordersdb.findByIdAndUpdate({_id:new Object(orderId)},{$set:{orderStatus:'Failed'}})
             .then(()=>{
                resolve()
             });
          }
       } catch (error) {
          reject(error);
          console.log("Error occured and rejected at updating payment status :",error.message);
       }
    })
 }


 
module.exports = {
    generatePaymentOrder,
    verifyOnlinePayment,
    updatePaymentStatus
}