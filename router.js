const express =  require('express')
const router = express.Router()

//Controller files user
const signupC = require("./controller/signupC")
const loginC = require("./controller/loginC")
const forgotC = require('./controller/forgotpassC')
const userProC = require('./controller/userProC')
//Controller files admin
const admLoginC = require('./controller/admLoginC')
const admDashC = require('./controller/admDashC')
const admUsersC = require('./controller/admUsersC')
const admCatC = require('./controller/admCatc')
const admProC = require('./controller/admProC')
//middleware
const {verifyToken,checkBlocked} = require('./middlewares/userAuth.js')
const adminAuth = require('./middlewares/adminAuth.js')


// //Admin Login
router.get('/admin',admLoginC.displayadminLogin)
router.get('/adminlog',admLoginC.manageadminLogout)
router.post('/admin',admLoginC.manageadminLogin)

// //Admin Dashboard
router.get('/dashboard',adminAuth,admDashC.displayadminDash)
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
router.get('/user-profile',verifyToken,checkBlocked,userProC.displayProfile)
router.post('/edit-profile',verifyToken,checkBlocked,userProC.editProfile)


//Products Page
router.get('/products',verifyToken,checkBlocked,userProC.displayPro) //All products 
router.get('/:category',verifyToken,checkBlocked,userProC.displayCat) //Category
router.get('/product-view/:id',verifyToken,checkBlocked,userProC.displayView) // view product
router.get('/product-order/:order',verifyToken,checkBlocked,userProC.filterPro) // filter products
router.get('/products/search',verifyToken,checkBlocked,userProC.displaySearch) // search products
router.get('/user-profile/logout',userProC.logoutUser) //Logout user




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




module.exports = router