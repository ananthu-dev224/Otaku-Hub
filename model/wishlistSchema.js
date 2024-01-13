const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
    userId:{
       type:mongoose.Schema.Types.ObjectId,
       required:true
    },
    products:[{
        productId:{
           type:mongoose.Schema.Types.ObjectId,
           ref:'products',
           required:true,
        }
     }]
})

const wishlist = mongoose.model('wishlist',wishlistSchema)

module.exports = wishlist