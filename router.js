const express =  require('express')
const router = express.Router()

//Controller files user
const signupC = require("./controller/signupC")
const loginC = require("./controller/loginC")
const forgotC = require('./controller/forgotpassC')
// Controller files admin
const admLoginC = require('./controller/admLoginC')
const admDashC = require('./controller/admDashC')
const admUsersC = require('./controller/admUsersC')



///// USER ZONE \\\\\

//Login
router.get('/login',loginC.displayLogin)
router.post('/login',loginC.manageLogin)

// Forgot Password
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




///// ADMIN ZONE \\\\

// //Admin Dashboard
router.get('/admin',admDashC.displayadminDash)

// //Admin Login
router.get('/admin/login',admLoginC.displayadminLogin)
router.post('/admin/login',admLoginC.manageadminLogin)


// //Admin Customers
router.get('/admin/view-users',admUsersC.displayUsers)
router.get('/admin/view-users/block/:id',admUsersC.blockUser)
router.get('/admin/view-users/block/:id',admUsersC.unblockUser)
router.get('/admin/view-users/search',admUsersC.searchUser)

// //Admin Category of Products











module.exports = router