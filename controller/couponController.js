// Coupon and Banner 
const coupondb = require('../model/couponSchema')
const bannerdb = require('../model/bannerSchema')
const cartdb = require('../model/cartSchema')
const path = require('path')
const multer = require('multer')



// Uploading banner
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, "public/banners") //location of storing images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)) //Gives unique names to files with the extension name from path
    }
})

const uploadBanner = multer({
    storage: storage,
    limits: { fieldSize: 5 * 1024 * 1024 } //5MB is the max size
})



// Admin Side
const displayCoupons = async (req, res) => {
    try {
        const coupons = await coupondb.find()
        res.render('adminCoupons', { coupons })
    } catch (error) {
        console.log("An error occured while displaying all coupons", error.messsage);
        res.render('error')
    }
}


// Add coupon page
const addCouponPage = async (req, res) => {
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log("An error occured while displaying add coupon page", error.messsage);
        res.render('error')
    }
}

// Add coupon to DB
const addCoupon = async (req, res) => {
    try {
        const { offername, coupon, range, discount, expire } = req.body
        console.log(req.body);
        const existingCoupon = await coupondb.findOne({ coupon: coupon })
        if (existingCoupon) {
            return res.json({ message: "Coupon Code already exists" })
        }
        if (discount > 100) {
            return res.json({ message: "Discount should be in % , cannot exceed 100" })
        }
        // Check if the expiry date is not before the current date
        const currentDate = new Date();

        // Parse the date string in yyyy-mm-dd format
        const [year, month, day] = expire.split('-');
        const expireDate = new Date(year, month - 1, day);

        if (expireDate < currentDate) {
            return res.json({ message: "Coupon expire date should not be before current date!" });
        }

        const newCoupon = new coupondb({
            coupon: coupon,
            range: range,
            offerName: offername,
            discount: discount,
            expire: expire
        })

        await newCoupon.save()
        res.json({ status: 'success', message: 'Coupon added successfully' })

    } catch (error) {
        console.log("An error occured while adding coupon to db", error.messsage);
        res.json({ status: 'error', messsage: 'An error occured please try again' })
    }
}



// Change coupon status
const restrictCoupon = async (req, res) => {
    try {
        const id = req.params.id;
        const coupon = await coupondb.findById(id)
        coupon.isActive = !coupon.isActive
        await coupon.save()
        res.json({ status: 'success' })
    } catch (error) {
        console.log("An error occured while changing status of coupon", error.messsage);
        res.json({ status: 'error' })
    }
}



// User side
const applyCoupon = async (req, res) => {
    try {
        const userId = req.userId;
        const { coupon } = req.body;


        if (coupon.trim() === '') {
            return res.json({ status: 'error', message: 'Enter a coupon' })
        }

        const enteredCoupon = await coupondb.findOne({ coupon: coupon })
        if (!enteredCoupon) {
            return res.json({ status: 'error', message: 'Coupon is not correct' })
        }

        const usedCoupon = await coupondb.findOne({ coupon: coupon, usedBy: userId })
        if (usedCoupon) {
            return res.json({ status: 'error', message: 'Coupon is already used' })
        }

        const cart = await cartdb.findOne({ userId: userId })
        const products = cart.products
        cart.total = products.reduce((total, product) => {
            return total + product.total;
        }, 0);
        const totalInCart = cart.total


        const couponDiscount = enteredCoupon.discount // Discount in %
        const grandTotal = Math.ceil(totalInCart - (totalInCart * couponDiscount / 100)); //Final amount after discount
        const couponId = enteredCoupon._id
        enteredCoupon.usedBy.push(userId)
        await enteredCoupon.save()
        res.json({ status: 'success', discount: couponDiscount, grandTotal: grandTotal, couponId: couponId })
    } catch (error) {
        console.log("An error occured while applying coupon", error.message);
        res.json({ status: 'error', message: 'An error occured please try again' })
    }
}



// Banner Admin Side
const displayBanners = async (req, res) => {
    try {
        const banners = await bannerdb.find()
        res.render('banners', { banners })
    } catch (error) {
        console.log("An error occured while displaying banners in admin", error.message);
        res.render('error')
    }
}

const addBannerPage = async (req, res) => {
    try {
        res.render('addBanner')
    } catch (error) {
        console.log("An error occured while displaying add banner", error.message);
        res.render('error')
    }
}


const addBanner = async (req, res) => {
    try {
        const finalImage = req.files['cropImage'][0].path
        const newBanner = new bannerdb({
            banner: finalImage
        })
        newBanner.save()
        res.json({ success: true })
    } catch (error) {
        console.log("An error occured while adding banner to db", error.message);
        res.json({ success: false })
    }
}

const toggleBanner = async (req, res) => {
    try {
        const bannerId = req.query.bannerId;
        const banner = await bannerdb.findById(bannerId)
        banner.isActive = !banner.isActive
        await banner.save()
        res.json({ status: 'success' })
    } catch (error) {
        console.log("An error occured while toggling banner status", error.message);
        res.json({ status: 'error' })
    }
}


module.exports = {
    displayCoupons,
    addCouponPage,
    addCoupon,
    restrictCoupon,
    applyCoupon,
    displayBanners,
    addBannerPage,
    addBanner,
    toggleBanner,
    uploadBanner,
}