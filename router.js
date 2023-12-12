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






// //Admin Login
router.get('/admin',admLoginC.displayadminLogin)
router.get('/adminlog',admLoginC.manageadminLogout)
router.post('/admin',admLoginC.manageadminLogin)

// //Admin Dashboard
router.get('/dashboard',admDashC.displayadminDash)

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

//Home Page



//Products Page
router.get('/products',userProC.displayPro) //All products 
router.get('/:category',userProC.displayCat) //Category
router.get('/product-view/:id',userProC.displayView) // view product


// //Admin Customers
router.get('/admin/view-users',admUsersC.displayUsers)
router.get('/admin/view-users/restrict/:id',admUsersC.manageToggleUser)
router.get('/admin/view-users/search',admUsersC.searchUser)

// //Admin Category of Products
router.get('/admin/categories',admCatC.displayCat)
router.get('/admin/categories/add',admCatC.displayCatAdd)
router.post('/admin/categories/add',admCatC.manageCatAdd)
router.get('/admin/categories/edit/:id',admCatC.displayCatEdit)
router.post('/admin/categories/edit/:id',admCatC.manageCatEdit)
router.get('/admin/categories/restrict/:id',admCatC.manageToggleCat)

// //Admin Products Panel
router.get('/admin/products',admProC.displayPro)
router.get('/admin/products/add',admProC.displayAddPro)
router.post('/admin/products/add',admProC.upload.fields([{ name: 'mainimage'}, { name: 'additionalimage'}]),admProC.manageAddPro)
router.get('/admin/products/edit/:id',admProC.displayEditPro)
router.get('/admin/products/restrict/:id',admProC.manageTogglePro)




module.exports = router