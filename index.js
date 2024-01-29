const express = require('express')
const app = express()
const path = require('path')
const router = require('./router')
const session = require('express-session')
const crypto = require('crypto')
const cookieParser = require('cookie-parser');
const nocache = require('nocache')

// Generate a random, secure session secret
const secretID = crypto.randomBytes(32).toString('hex');


//Database require
const db = require('./model/db')



//Connect db
db()


// Load environment variables from .env
require('dotenv').config();

//Port 
const PORT = process.env.PORT || 3005

//No cache
app.use(nocache())

//session
app.use(session({
   secret: secretID,
   resave: false,
   saveUninitialized: true
}))

//middleware for parsing json data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());



//Static files
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, '/public/assets')))
app.use('/public/productimgs', express.static(path.join(__dirname, 'public', 'productimgs')));
app.use('/public/banners', express.static(path.join(__dirname, 'public', 'banners')));


//view engine
app.set('view engine', 'ejs')


app.use('/', router)




app.listen(PORT, () => {
   console.log(`Server started at http://localhost:${PORT}`);
})