const mongoose = require('mongoose')

//connect to mongodb
let db = async()=>{
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/Otaku_Hub')
      console.log("Connected to Database");
    } catch (error) {
      console.log("Error in Connecting Database",error.message);
      process.exit(1);
    }
}






module.exports = db