const express =  require('express')
const router = express.Router()

//Controller files user
const signupC = require("./controller/signupController.js")
const loginC = require("./controller/loginController.js")
const forgotC = require('./controller/forgotpassController.js')
const userProC = require('./controller/userProductsController.js')
const userCartC = require('./controller/userCartController.js')
const userOrderC = require('./controller/userOrderController.js')
const userWishlistC = require('./controller/userWishlistController.js')
//Controller files admin
const admLoginC = require('./controller/adminLoginController.js')
const admDashC = require('./controller/adminDashController.js')
const admUsersC = require('./controller/adminUserController.js')
const admCatC = require('./controller/adminCategoryController.js')
const admProC = require('./controller/adminProductsController.js')
const admOrderC = require('./controller/adminOrderController.js')
const couponC = require('./controller/couponController.js')
//Middleware
const {verifyToken,checkBlocked,checkBlockedFetch} = require('./middlewares/userAuth.js')
const adminAuth = require('./middlewares/adminAuth.js')


// //Admin Login and Logout
router.get('/admin',admLoginC.displayadminLogin)
router.get('/adminlog',admLoginC.manageadminLogout)
router.post('/admin',admLoginC.manageadminLogin)

// //Admin Dashboard
router.get('/dashboard',adminAuth,admDashC.displayadminDash)

// Landing Page
router.get('/',loginC.displayLandingPage)


//Home Page
router.get('/home',verifyToken,checkBlocked,loginC.displayHome)


//Login
router.get('/login',loginC.displayLogin)
router.post('/login',loginC.manageLogin)


//Forgot Password
router.get('/forgot-password',forgotC.displayForgot) 
router.post('/forgot-password',forgotC.manageForgot)
router.get('/forgot-password/verify',forgotC.displayOtp)
router.post('/forgot-password/verify',forgotC.manageOtp)
router.post('/resent-otp',forgotC.resentOtp)
router.get('/new-password',forgotC.displayNew)
router.post('/new-password',forgotC.manageNew)

//Signup
router.get('/signup', signupC.displaySignup)
router.post('/signup',signupC.manageSignup)

//Verification
router.get('/otp-verification',signupC.displayOtp)
router.post('/otp-verification',signupC.manageOtp)
router.post('/otp-verification/resent-otp',signupC.resentOtp)


// Profile Page
router.get('/my-profile',verifyToken,checkBlocked,userProC.displayProfile)
router.post('/edit-profile',verifyToken,checkBlockedFetch,userProC.editProfile) 
router.post('/change-password',verifyToken,checkBlockedFetch,userProC.changePass)
router.post('/add-referral',verifyToken,checkBlockedFetch,loginC.addReferral)


//Products and Profile page
router.get('/products',verifyToken,checkBlocked,userProC.displayPro) // All products 
router.get('/product-view/:id',verifyToken,checkBlocked,userProC.displayView) // view product
router.get('/price',verifyToken,checkBlocked,userProC.filterPro) // filter products
router.get('/search-products',verifyToken,checkBlocked,userProC.displaySearch) // search products
router.get('/edit-address/:id',verifyToken,checkBlocked,userProC.displayEditAddress) 
router.post('/edit-address/:id',verifyToken,checkBlockedFetch,userProC.manageEditAddress) 
router.get('/remove-address/:id',verifyToken,checkBlockedFetch,userProC.manageDeleteAddress)  
router.get('/my-profile/address',verifyToken,checkBlocked,userProC.displayManageAddress) 
router.post('/my-profile/add-address',verifyToken,checkBlockedFetch,userProC.manageAddAddress) 
router.get('/category',verifyToken,checkBlocked,userProC.displayCat) //Category
router.get('/my-profile/logout',userProC.logoutUser) //Logout user

// Cart
router.get('/cart',verifyToken,checkBlocked,userCartC.displayCart) //Cart
router.get('/add-to-cart',verifyToken,checkBlockedFetch,userCartC.manageAddToCart) // Add to Cart
router.get('/remove-product-cart',verifyToken,checkBlockedFetch,userCartC.manageRemoveProduct) // Remove from Cart
router.post('/update-quantity',verifyToken,checkBlockedFetch,userCartC.updateQuantity) //Increase or Decrease quantity



//This route is only used to check the stock  in proceed to checkout and place order
router.get('/checkstock',verifyToken,userCartC.manageStock)

// Wishlist
router.get('/wishlist',verifyToken,checkBlocked,userWishlistC.displayWishlist) 
router.get('/add-wishlist',verifyToken,checkBlockedFetch,userWishlistC.addToWishlist)
router.get('/remove-wishlist',verifyToken,checkBlockedFetch,userWishlistC.removeWishlist)




// Checkout
router.get('/checkout',verifyToken,checkBlocked,userCartC.displayCheckout) // checkout page

// Coupon
router.post('/apply-coupon',verifyToken,checkBlockedFetch,couponC.applyCoupon)

// Order
router.post('/place-order',verifyToken,checkBlockedFetch,userOrderC.placeOrder)
router.get('/orders',verifyToken,checkBlocked,userOrderC.displayOrders)
router.get('/order-details',verifyToken,checkBlocked,userOrderC.displaySingleOrder)
router.get('/cancel-order',verifyToken,checkBlockedFetch,userOrderC.cancelOrder)
router.post('/payment-verification',verifyToken,checkBlockedFetch,userOrderC.verifyPaymentAndStatus)
router.post('/return-order',verifyToken,checkBlockedFetch,userOrderC.returnOrder)
router.get('/cancel-return',verifyToken,checkBlockedFetch,userOrderC.cancelRequest)
router.post('/order-details/generate-invoice',verifyToken,checkBlockedFetch,userOrderC.invoice)

// Wallet
router.get('/wallet',verifyToken,checkBlocked,loginC.displayWallet)
router.post('/recharge-wallet',verifyToken,checkBlockedFetch,loginC.rechargeWallet)
router.get('/clear-history',verifyToken,checkBlockedFetch,loginC.clearHistory)


// //Admin Dashboard
router.get('/dashboard/filter-sales',adminAuth,admDashC.filterSales)
router.post('/dashboard/filter-by-date',adminAuth,admDashC.filterByDate)
router.post('/dashboard/generate-report',adminAuth,admDashC.generateSalesPdf)
router.post('/dashboard/generate-excel-report',adminAuth,admDashC.generateSalesExcel)





// //Admin Customers
router.get('/admin/view-users',adminAuth,admUsersC.displayUsers)
router.get('/admin/view-users/restrict/:id',adminAuth,admUsersC.manageToggleUser)
router.get('/admin/view-users/search',adminAuth,admUsersC.searchUser)

// //Admin Category of Products
router.get('/admin/categories',adminAuth,admCatC.displayCat)
router.get('/admin/categories/add',adminAuth,admCatC.displayCatAdd)
router.post('/admin/categories/add',adminAuth,admCatC.manageCatAdd)
router.get('/admin/categories/edit/:id',adminAuth,admCatC.displayCatEdit)
router.post('/admin/categories/edit/:id',adminAuth,admCatC.manageCatEdit)
router.get('/admin/categories/restrict/:id',adminAuth,admCatC.manageToggleCat)

// //Admin Products Panel
router.get('/admin/products',adminAuth,admProC.displayPro)
router.get('/admin/products/add',adminAuth,admProC.displayAddPro)
router.post('/admin/products/add',adminAuth,admProC.upload.fields([{ name: 'mainimage'}, { name: 'additionalimage'}]),admProC.manageAddPro)
router.get('/admin/products/edit/:id',adminAuth,admProC.displayEditPro)
router.post('/admin/products/edit/:id',adminAuth,admProC.upload.fields([{ name: 'mainimage'}, { name: 'additionalimage'}]),admProC.manageEditPro)
router.get('/admin/products/restrict/:id',adminAuth,admProC.manageTogglePro)
router.get('/admin/products/remove/:id',adminAuth,admProC.removePro)
router.get('/admin/search-product',adminAuth,admProC.searchProduct)



// //Admin Order Management
router.get('/admin/order-details',adminAuth,admOrderC.displayOrdersAdmin)
router.get('/admin/change-status',adminAuth,admOrderC.displayChangeOrderStatus)
router.post('/admin/change-status/:id',adminAuth,admOrderC.changeOrderStatus)
router.get('/admin/search-order',adminAuth,admOrderC.searchOrder)
router.get('/admin/approve-return',adminAuth,admOrderC.approveReturn)
router.get('/admin/decline-return',adminAuth,admOrderC.declineReturn)

// //Admin Coupon Management
router.get('/admin/coupon',adminAuth,couponC.displayCoupons)
router.get('/admin/coupon/add',adminAuth,couponC.addCouponPage)
router.post('/admin/coupon/add',adminAuth,couponC.addCoupon)
router.get('/admin/coupon/restrict/:id',adminAuth,couponC.restrictCoupon)

// //Admin Banner Management
router.get('/banners',adminAuth,couponC.displayBanners)
router.get('/admin/banners/add',adminAuth,couponC.addBannerPage)
router.post('/admin/banners/add',adminAuth,couponC.uploadBanner.fields([{ name: 'originalImage'},{name: 'cropImage'}]),couponC.addBanner)
router.get('/banners/restrict',adminAuth,couponC.toggleBanner)






module.exports = router