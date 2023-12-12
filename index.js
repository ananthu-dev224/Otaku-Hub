const express = require('express')
const app = express()
const path = require('path')
const router = require('./router')
const {v4:uuid} = require('uuid')
const session = require('express-session')


//Database require
const db = require('./model/db')
const userSchema = require('./model/userSchema')
const nocache = require('nocache')


//Connect db
db()

//Port 
const PORT = 3000 || process.env.PORT


//session
app.use(session({
   secret:uuid(),
   resave:false,
   saveUninitialized:true
}))

//middleware for parsing json data
app.use(express.json())
app.use(express.urlencoded({extended:true}))

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