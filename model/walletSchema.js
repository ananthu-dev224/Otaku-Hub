const mongoose = require('mongoose');


const walletSchema = new mongoose.Schema({
   userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user',
      required:true,
   },
   amount:{
      type:Number,
      default:0,
   },
   transactionHistory:{
      type:Array,
   }
})

const Wallet = mongoose.model('Wallet',walletSchema)

module.exports = Wallet;