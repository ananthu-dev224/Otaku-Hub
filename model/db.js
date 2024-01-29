const mongoose = require('mongoose')

//connect to mongodb
let db = async()=>{
    try {
      await mongoose.connect('mongodb://ananthuks9526:EWyBaC1Vf2nDAfvy@ac-86esuuz-shard-00-00.yirplhg.mongodb.net:27017,ac-86esuuz-shard-00-01.yirplhg.mongodb.net:27017,ac-86esuuz-shard-00-02.yirplhg.mongodb.net:27017/?ssl=true&replicaSet=atlas-qt9xng-shard-0&authSource=admin&retryWrites=true&w=majority')
      console.log("Connected to Database");
    } catch (error) {
      console.log("Error in Connecting Database",error.message);
      process.exit(1);
    }
}







module.exports = db