const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    coupon:{
        type:String,
        required:true
    },
    range:Number,
    offerName:String,
    discount:Number,
    expire:Date,
    isActive:{
        type:Boolean,
        default:true
    },
    usedBy:Array
})

const coupon = mongoose.model('coupon',couponSchema)


module.exports = coupon;