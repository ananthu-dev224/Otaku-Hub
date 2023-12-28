const mongoose = require('mongoose')
const userSchema = require('../model/userSchema')
const productsSchema = require('../model/productSchema')

const cartSchema = new mongoose.Schema({
    userId:{
       type:mongoose.Schema.Types.ObjectId,
       required:true
    },
    products:[{
        productId:{
           type:mongoose.Schema.Types.ObjectId,
           ref:'products',
           required:true,
        },
        size:{
          type:String,
          required:false,
          default:null
        },
        quantity:{
           type:Number,
           required:true,
           default:1,
        },
        total:{
           type:Number,
        },
     }]
})

const cart = mongoose.model('cart',cartSchema)

module.exports = cart