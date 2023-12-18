const express = require('express')
const app = express()
const path = require('path')
const router = require('./router')
const {v4:uuid} = require('uuid')
const session = require('express-session')
const crypto = require('crypto')
const cookieParser = require('cookie-parser');

// Generate a random, secure session secret
const secretID = crypto.randomBytes(32).toString('hex');
console.log(secretID);

//Database require
const db = require('./model/db')
const userSchema = require('./model/userSchema')


//Connect db
db()


// Load environment variables from .env
require('dotenv').config();

//Port 
const PORT = process.env.PORT || 3005


//session
app.use(session({
   secret:secretID,
   resave:false,
   saveUninitialized:true
}))

//middleware for parsing json data
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
const nocache = require('nocache')
//No cache
app.use(nocache())


//Static files
app.use('/static',express.static(path.join(__dirname,'public')))
app.use('/assets',express.static(path.join(__dirname,'/public/assets')))
app.use('/public/productimgs', express.static(path.join(__dirname, 'public','productimgs')));


//view engine
app.set('view engine','ejs')


app.use('/',router)


app.listen(PORT,'localhost',()=>{
   console.log(`Server started at http://localhost:${PORT}`);
})