const express = require('express')
const app = express() //express ke function app se call ho jayega jo node ki framework
const port =3000
const web = require('./routing/web')
const connectDb = require('./db/connectdb')
const bodyParser = require('body-parser') //for data convert into object

const cookieParser = require('cookie-parser')
//token get
app.use(cookieParser())

//image upload
const fileUpload = require('express-fileupload')
//image upload
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

//connect flash and sessions
const session = require('express-session')
const flash = require('connect-flash')
//message
app.use(session({
    secret:'secret',
    cookie:{ maxAge: 60000},
    resave: false,
    saveUninitialized: false,
}));
//Flash message
app.use(flash());

// parse application/x-www-form-urlencoded
//jo data aata jo usse object ke format me convert krte hai
app.use(bodyParser.urlencoded({ extended: false }))

//for public folder link 
app.use(express.static('public'))

//ejs for views the html file
app.set('view engine','ejs')

//connection call for connect db mongo
connectDb()

//localhost:3000 route load
app.use('/',web)

//liste server ko chalata isse server create hoga ,listen express js ka fuction hai
app.listen(port,console.log("server start localhost:3000"))

