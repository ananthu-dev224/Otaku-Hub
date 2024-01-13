const mongoose = require('mongoose')
const categories = require('./categorySchema')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,  //we told mongoose to use the id from categories using population
        ref:'categories'
    },
    description:String,
    quantity:[{
        size:{type:String,required:false,default:null},
        stock:{type:Number,min:0,required:true,default:0}
    }],
    price:Number,
    mainimage:String,
    additionalimages:Array,
    isPublished:{
        type:Boolean,
        default:true
    },
    discount:{
        type:Number,
        default:0, //0% is the default discount
        required:false
    }

})


const products = mongoose.model('products',productSchema)

module.exports = products