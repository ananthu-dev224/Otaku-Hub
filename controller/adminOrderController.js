const ordersdb = require('../model/ordersSchema')
const adminOrder = {}


// display orders in admin 
adminOrder.displayOrdersAdmin = async (req,res) => {
    try {
        const orders = await ordersdb.find()
        .populate('products.productId')
        .sort({ date: -1 })
        .exec();   // sorting in descending order so that the latest orders appears first;
 
       if(orders){
        res.render('adminOrders',{orders})
       }else{
        console.log("Orders are empty");
        res.render("error")
       }
    } catch (error) {
        console.log("An error occured at orders display page admin",error.message);
        res.render("error")
    }
}


// display  change order status page
adminOrder.displayChangeOrderStatus = async (req,res) =>{
    try {
       const orderId = req.query.orderId
       const order = await ordersdb.findById(orderId)
       res.render('edit-order',{order})
    } catch (error) {
        console.log("An error occured while displaying change order status page",error.message);
        res.render("error")  
    }
}

// change order status
adminOrder.changeOrderStatus = async (req,res) =>{
    try {
        const {status,orderId} = req.body;
        const orderData = await ordersdb.findById(orderId).populate('products.productId');
        const exisitingStatus = orderData.orderStatus
        if( exisitingStatus === 'Cancelled'){
            return res.json({message:'Order Already Cancelled'})
       }else if( exisitingStatus === 'Delivered'){
         return res.json({message:'Order Already Delivered'})
       }else if(status === 'Delivered'){
           orderData.deliveredDate = new Date()
           orderData.orderStatus = status;
           await orderData.save()
        }else{
           orderData.orderStatus = status;
           await orderData.save()
        }
        res.json({status:'success',message:'Status updated successfully'})
    } catch (error) {
        console.log("An error occured while changing order status",error.message);
        res.json({status:'error',message:'An error occured please try again'})  
    }
}





















module.exports = adminOrder;