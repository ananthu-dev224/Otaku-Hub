const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    banner:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }
})

const banner = mongoose.model('banner',bannerSchema)

module.exports = banner;