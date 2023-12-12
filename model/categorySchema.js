const mongoose = require('mongoose')
const productSchema = require('../model/productSchema')

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    products:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products',
    }]
})

const categories = mongoose.model('categories',categorySchema)





module.exports = categories