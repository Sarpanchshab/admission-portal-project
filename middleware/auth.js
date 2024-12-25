const UserModel = require('../models/user')
const jwt = require('jsonwebtoken')

const checkAuth = async (req,res,next) =>{
    // console.log("hello auth")
    const {token} = req.cookies
    // console.log(token)
    if(!token){
        req.flash('error', 'Unauthorised user please login')
        res.redirect('/')
    }else{
        const verifyToken= jwt.verify(token,'sarpanchshab')
        //console.log(verifyToken) isme id uth ke aayegi or data se match kara li
        const data = await UserModel.findOne({_id:verifyToken.ID})
        // console.log(data)
        req.userdata = data
        next()
    }
}
module.exports = checkAuth