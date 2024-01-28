const ordersdb = require('../model/ordersSchema')
const walletdb = require('../model/walletSchema')
const adminOrder = {}

const stockHelper = require('../helpers/stockHelper')


// display orders in admin 
adminOrder.displayOrdersAdmin = async (req, res) => {
    try {
        const perPage = 10; // Number of orders per page
        const currentPage = parseInt(req.query.page) || 1; // Get the page from the query parameter, default to 1

        const totalOrders = await ordersdb.countDocuments({});
        const totalPages = Math.ceil(totalOrders / perPage);

        const orders = await ordersdb.find()
            .populate('products.productId')
            .sort({ date: -1, _id: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .exec();

        res.render('adminOrders', { orders, currentPage, totalPages, search:null });
    } catch (error) {
        console.log("An error occured at orders display page admin", error.message);
        res.render("error")
    }
}


// display  change order status page
adminOrder.displayChangeOrderStatus = async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await ordersdb.findById(orderId)
        res.render('edit-order', { order })
    } catch (error) {
        console.log("An error occured while displaying change order status page", error.message);
        res.render("error")
    }
}

// change order status
adminOrder.changeOrderStatus = async (req, res) => {
    try {
        const { status, orderId } = req.body;
        const orderData = await ordersdb.findById(orderId).populate('products.productId');
        const userId = orderData.userId;
        const exisitingStatus = orderData.orderStatus
        if (exisitingStatus === 'Cancelled') {
            return res.json({ message: 'Order Already Cancelled' })
        } else if (exisitingStatus === 'Delivered' || exisitingStatus === 'Request declined' || exisitingStatus === 'Request cancelled') {
            return res.json({ message: 'Order Already Delivered' })
        } else if (exisitingStatus === 'Failed') {
            return res.json({ message: 'Order payment is failed , cant change status' })
        } else if (exisitingStatus === 'Returned' || exisitingStatus === 'Return requested') {
            return res.json({ message: 'Order is in a return stage , cant change status' })
        } else if (status === 'Delivered') {
            orderData.deliveredDate = new Date()
            orderData.orderStatus = status;
            await orderData.save()
        } else if (status === 'Returned') {
            // Add the stock back when the order returned also if it is razorpay or wallet refund the money
            await stockHelper.updateStock(orderData);
            // Refund amount in wallet
            if (orderData.paymentMethod !== 'COD') {
                let wallet = await walletdb.findOne({ userId: userId })
                if (!wallet) {
                    wallet = new walletdb({ userId: userId })
                    await wallet.save()
                }
                const amount = orderData.totalAmount;
                wallet.amount += amount;
                wallet.transactionHistory.push(amount)
                await wallet.save()
            }
            orderData.orderStatus = status;
            await orderData.save()
        } else {
            orderData.orderStatus = status;
            await orderData.save()
        }
        res.json({ status: 'success', message: 'Status updated successfully' })
    } catch (error) {
        console.log("An error occured while changing order status", error.message);
        res.json({ status: 'error', message: 'An error occured please try again' })
    }
}


// Search order by id
adminOrder.searchOrder = async (req, res) => {
    try {
        const perPage = 10; // Number of orders per page
        const currentPage = parseInt(req.query.page) || 1; // Get the page from the query parameter, default to 1

        const { orderId } = req.query;
        const regex = new RegExp(orderId, 'i');

        const totalOrders = await ordersdb.countDocuments({ trackingId: { $regex: regex } });
        const totalPages = Math.ceil(totalOrders / perPage);

        const orders = await ordersdb.find({ trackingId: { $regex: regex } })
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .exec();

        res.render('adminOrders', { orders, currentPage, totalPages, search:orderId });


    } catch (error) {
        console.log("An error occured while searching order", error.message);
        res.redirect('/admin/order-details')
    }
}

// Approve return request
adminOrder.approveReturn = async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await ordersdb.findById(orderId);
        order.orderStatus = 'Request approved'
        await order.save()
        res.redirect('/admin/order-details')
    } catch (error) {
        console.log("An error occured while approving the return order", error.message);
        res.render('error')
    }
}
// Decline return request
adminOrder.declineReturn = async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await ordersdb.findById(orderId);
        order.orderStatus = 'Request declined'
        await order.save()
        res.redirect('/admin/order-details')
    } catch (error) {
        console.log("An error occured while declining the return order", error.message);
        res.render('error')
    }
}






module.exports = adminOrder;