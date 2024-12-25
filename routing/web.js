const express = require('express')
const FrontController = require('../controller/FrontController')
const AdminController = require('../controller/admin/AdminController')
const route = express.Router()
const checkAuth = require('../middleware/auth')
const CourseController = require('../controller/CourseController')
const adminrole = require('../middleware/adminrole')
const isLogin = require('../middleware/isLogin')

//User Routing
route.get('/home',checkAuth,FrontController.home)
route.get('/about',checkAuth,FrontController.about)
route.get('/',isLogin,FrontController.login)
route.get('/register',FrontController.register)
route.get('/contact',checkAuth,FrontController.contact)
route.get('/profile',checkAuth,FrontController.profile)
route.post('/changePassword',checkAuth,FrontController.changePassword)
route.post('/updateProfile',checkAuth,FrontController.updateProfile)
route.post('/contactQuery',checkAuth,FrontController.contactquery)

//insert Data
route.post('/insertStudent',FrontController.studentInsert)
//verifylogin
route.post('/verifyLogin',FrontController.verifyLogin)
route.get('/logout',FrontController.logout)

//Admin Routing
route.get('/admin/dashboard',checkAuth,adminrole('admin'),AdminController.dashboard)
route.get('/admin/studentDisplay',checkAuth,adminrole('admin'),AdminController.studentDisplay)
route.get('/admin/studentView/:id',checkAuth,adminrole('admin'),AdminController.studentView) //id bhi bheje/:id laga ke
route.get('/admin/studentDelete/:id',checkAuth,adminrole('admin'),AdminController.studentDelete)
route.get('/admin/studentEdit/:id',checkAuth,AdminController.studentEdit) //for get the data

route.post('/admin/studentUpdate/:id',checkAuth,adminrole('admin'),AdminController.studentUpdate) //for update the post to model
route.post('/admin/insertStudent',checkAuth,adminrole('admin'),AdminController.studentInsert)
route.get('/admin/courseDisplay',checkAuth,adminrole('admin'),AdminController.courseDisplay)

route.post('/update_status/:id',checkAuth,adminrole('admin'),AdminController.update_status) //status for approval or reject
route.get('/admin/contact',checkAuth,adminrole('admin'),AdminController.contact)

route.get('/admin/edit_profile',checkAuth,adminrole('admin'),AdminController.Edit_Profile)
route.post('/admin/update_profile/:id',checkAuth,adminrole('admin'),AdminController.Update_Profile)

route.get('/admin/edit_password',checkAuth,adminrole('admin'),AdminController.Edit_Password)
route.post('/admin/change_password',checkAuth,adminrole('admin'),AdminController.ChangePassword)

//Course Controller
route.post('/course_insert',checkAuth,CourseController.courseinsert)
route.get('/coursedisplay',checkAuth,CourseController.coursedisplay)
route.get("/courseView/:id",checkAuth,CourseController.courseView)
route.get("/courseEdit/:id",checkAuth,CourseController.courseEdit)
route.post("/courseUpdate/:id",checkAuth,CourseController.courseUpdate)
route.get("/courseDelete/:id",checkAuth,CourseController.courseDelete)

//forgot password
route.post('/forgot_Password',FrontController.forgetPasswordVerify)

//reset password
route.get('/reset-password',FrontController.reset_Password)
route.post('/reset_password1',FrontController.reset_Password1)

//verify mail
route.get('/verify',FrontController.verifyMail)

module.exports = route