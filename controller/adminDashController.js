//Admin Dashboard controller
const ordersdb = require('../model/ordersSchema')
const productsdb = require('../model/productSchema')
const categorydb = require('../model/categorySchema')
const usersdb = require('../model/userSchema')
const admDashC = {}

//displayadminDash
admDashC.displayadminDash = async (req,res) =>{
    try { 
        const orders = await ordersdb.aggregate([
            {
              $match: {
                orderStatus: 'Delivered',
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
              },
            },
          ]);
        const totalOrders = await ordersdb.find({orderStatus:'Delivered'}).count()
        const totalProducts = await productsdb.find().count()
        const totalCategory = await categorydb.find().count()
        const totalUsers = await usersdb.find().count()
        // Extract the totalRevenue from the result array
        const totalRevenue = orders.length > 0 ? orders[0].totalRevenue : 0;
        res.render('adminPanel',{totalRevenue,totalOrders,totalCategory,totalProducts,totalUsers})
    } catch (error) {
        res.render("error")
        console.log("An error occured while loading admin dashboard",error.message);
    }
}



// Get sales data daily , weekly , monthly and yearly


module.exports = admDashC