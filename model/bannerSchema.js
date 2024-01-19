const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    banners:{
        type:Array,
        required:true
    }
})

const banner = mongoose.model('banner',bannerSchema)

module.exports = banner;