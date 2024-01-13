const mongoose = require('mongoose');

const ordersModel = new mongoose.Schema({
   trackingId:{
      type:String,
      default:function(){
         return Math.floor(100000 + Math.random() * 900000).toString();
      },
      unique:true
   },
   userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user',
   },
   date:{
      type:Date,
      default:new Date(),
      required:true,
   },
   couponDiscount:{
      type:Number,
      default:0
   },
   totalAmount:{
      type:Number,
      required:true,
   },
   paymentMethod:{
      type:String,
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
   }],
   address:{
    name:String,
    mobile:Number,
    houseaddress:String, 
    street:String,
    city:String,
    pincode:Number,
    state:String,
 },
   orderStatus:{
      type:String,
      default:'Pending',
   },
   deliveredDate:{
      type:Date,
      default:'',
   },
   message:{
      type:String,
      default:null
   }
})

module.exports = mongoose.model('Order',ordersModel);