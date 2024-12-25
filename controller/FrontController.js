const CourseModel = require('../models/course')
const UserModel = require('../models/user')
const bcrypt = require('bcrypt')
const cloudinary = require("cloudinary");
const jwt = require('jsonwebtoken');
const ContactModel = require('../models/contact');
const randomstring = require("randomstring");
const nodemailer = require('nodemailer')
const adminrole = require('../middleware/adminrole')

cloudinary.config({
    cloud_name: "dfpkxjf3y",
    api_key: "882943454568449",
    api_secret: "QaWojDLtTyJ4L8eA8OCQ9EPsV8o",
})

class FrontController {

    static home = async (req, res) => {
        try {
            const { name, image, email, id } = req.userdata
            const btech = await CourseModel.findOne({ user_id: id, course: "btech" });
            const bca = await CourseModel.findOne({ user_id: id, course: "bca" });
            const mca = await CourseModel.findOne({ user_id: id, course: "mca" });
            res.render("home", { n: name, i: image, e: email, btech: btech, mca: mca, bca: bca })
        } catch (error) {
            console.log(error)
        }
    }

    static about = async (req, res) => {
        try {
            const { name, image } = req.userdata
            res.render('about', { n: name, i: image })
        } catch (error) {
            console.log(error)
        }
    }

    static login = async (req, res) => {
        try {
            res.render('login', { message: req.flash('success'),msg: req.flash("success"), msg: req.flash("error") })
        } catch (error) {
            console.log(error)
        }
    }

    static register = async (req, res) => {
        try {
            res.render('register', { message: req.flash("error"), msg: req.flash("success") });
        } catch (error) {
            console.log(error)
        }
    }

    static contact = async (req, res) => {
        try {

            const { name, image } = req.userdata
            res.render('contact', { n: name, i: image, msg: req.flash("sucess") })
        } catch (error) {
            console.log(error)
        }
    }


    //Insert Student
    static studentInsert = async (req, res) => {
        try {
            // console.log(req.body)  //input me jo diya hai data name me wo aayega
            const { name, email, password, confirmpassword } = req.body
            if (!name || !email || !password || !confirmpassword) {
                req.flash('error', "All Fields are required");
                return res.redirect("/register");
            }

            const isEmail = await UserModel.findOne({ email });
            // console.log(isEmail)
            if (isEmail) {
                req.flash("error", "Email already Exists");
                return res.redirect("/register");
            }


            if (password != confirmpassword) {
                req.flash("error", "Password doesnot match")
                return res.redirect("/register")
            }

            // console.log(req.files)
            const file = req.files.image

            //ye image cloudinary par uth ke jayegi file me req.files.image hai
            const imageUpload = await cloudinary.uploader.upload(
                file.tempFilePath,
                {
                    folder: "userprofile",
                }
            )
            //console.log(imageUpload);

            const hashpassword = await bcrypt.hash(password, 10)
            const data = await UserModel.create({
                name,
                email,
                password: hashpassword,
                image: {
                    public_id: imageUpload.public_id,
                    url: imageUpload.secure_url
                }
            })
            if(data){
                //token create
                const token = jwt.sign({ ID: data._id }, 'sarpanchshab')
                res.cookie('token', token)

                this.sendVerifymail(name ,email , data._id);
                //To redirect to login page
                req.flash(
                    "success",
                    "Your Registration has been successfully. Please Verify your mail."
                );
                res.redirect("/register")
                
            }else
            {
                req.flash("error","Not Register.")
                res.redirect("/register")
            }
            req.flash("success", "Register Success! Plz Login")
            res.redirect("/") //route **web

        } catch (error) {
            console.log('error')
        }
    }
     
    //registration verify mail
    static sendVerifymail = async (name, email, user_id) => {
        //console.log(name, email, user_id);
        // connect with the smtp server
    
        let transporter = await nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
    
          auth: {
            user: "monu1999june@gmail.com",
            pass: "cyxw tlxw qmva cqpw",
          },
        });
        let info = await transporter.sendMail({
          from: "test@gmail.com", // sender address
          to: email, // list of receivers
          subject: "For Verification mail", // Subject line
          text: "heelo", // plain text body
          html:
            "<p>Hii " +
            name +
            ',Please click here to <a href="https://admission-portal-project-b14l.onrender.com/verify?id=' +
            user_id +
            '">Verify</a>Your mail</p>.',
        });
        //console.log(info);
    };

    static verifyMail = async (req, res) => {
        try {
          const updateinfo = await UserModel.findByIdAndUpdate(req.query.id, {
            is_verified: 1,
          });
          if (updateinfo) {
            res.redirect("/home");
          }
        } catch (error) {
          console.log(error)
        }
    }

    static verifyLogin = async (req, res) => {
        try {
            // console.log(req.body)

            const { email, password } = req.body
            const user = await UserModel.findOne({ email: email })
            if (user != null) {
                //for password match bcrypt is used
                const isMatched = await bcrypt.compare(password, user.password)
                // console.log(isMatched)
                if (isMatched) {

                    // if (user.role == 'admin') {
                    //     //token create
                    //     const token = jwt.sign({ ID: user._id }, 'sarpanchshab')
                    //     //console.log(token)
                    //     res.cookie('token', token)
                    //     res.redirect('/admin/dashboard')
                    // }

                    // if (user.role == 'student') {
                    //     //token create
                    //     const token = jwt.sign({ ID: user._id }, 'sarpanchshab')
                    //     //console.log(token)
                    //     res.cookie('token', token)
                    //     res.redirect("/home")
                    // }

                    if (user.role == "admin" && user.is_verified == 1) {
                        const token = jwt.sign({ ID: user._id }, 'sarpanchshab');
                        // console.log(token)
                        res.cookie('token', token)
                        res.redirect('/admin/dashboard')

                    } else if (user.role == "student" && user.is_verified == 1) {
                        const token = jwt.sign({ ID: user._id }, 'sarpanchshab');
                        // console.log(token)
                        res.cookie('token', token)
                        res.redirect('/home')
                    }
                    else {
                        req.flash("error", "Please verify your email.")
                        res.redirect('/')
                    }

                }
                else {
                    req.flash('error', 'Email or Password is not valid')
                    return res.redirect('/')
                }

            }
            else {
                req.flash('error', 'You are not a register user')
                return res.redirect('/')
            }

        } catch (error) {
            console.log(error)
        }
    }

    static logout = async (req, res) => {
        try {
            res.clearCookie("token")
            res.redirect('/')
        } catch (error) {
            console.log(error)
        }
    }

    static profile = async (req, res) => {
        try {
            const { name, image, email, id } = req.userdata

            res.render('profile', { n: name, i: image, e: email, msg: req.flash('success') })
        } catch {
            console.log(error)
        }
    }

    static changePassword = async (req, res) => {
        try {
            const { id } = req.userdata;
            //console.log(req.body)
            const { op, np, cp } = req.body;
            if (op && np && cp) {
                const user = await UserModel.findById(id);
                const isMatched = await bcrypt.compare(op, user.password);
                //console.log(isMatched)
                if (!isMatched) {
                    req.flash("error", "Current password is incorrect ");
                    res.redirect("/profile");
                } else {
                    if (np != cp) {
                        req.flash("error", "Password does not match");
                        res.redirect("/profile");
                    } else {
                        const newHashPassword = await bcrypt.hash(np, 10);
                        await UserModel.findByIdAndUpdate(id, {
                            password: newHashPassword,
                        });
                        req.flash("success", "Password Updated successfully ");
                        res.redirect("/");
                    }
                }
            } else {
                req.flash("error", "ALL fields are required ");
                res.redirect("/profile");
            }
        } catch (error) {
            console.log(error);
        }
    };

    static updateProfile = async (req, res) => {
        try {
            const { id } = req.userdata;
            const { name, email, role } = req.body;
            if (req.files) {
                const user = await UserModel.findById(id);
                const imageID = user.image.public_id;
                //console.log(imageID);

                //deleting image from Cloudinary
                await cloudinary.uploader.destroy(imageID);
                //new image update
                const imagefile = req.files.image;
                const imageupload = await cloudinary.uploader.upload(
                    imagefile.tempFilePath,
                    {
                        folder: "userprofile",
                    }
                );
                var data = {
                    name: name,
                    email: email,
                    image: {
                        public_id: imageupload.public_id,
                        url: imageupload.secure_url,
                    },
                };
            } else {
                var data = {
                    name: name,
                    email: email,
                };
            }
            await UserModel.findByIdAndUpdate(id, data);
            req.flash("success", "Update Profile successfully");
            res.redirect("/profile");
        } catch (error) {
            console.log(error);
        }
    };

    static contactquery = async (req, res) => {
        try {
            console.log(req.body)
            const { n, nu, e, m } = req.body
            const data = await ContactModel.create({
                name: n,
                number: nu,
                email: e,
                message: m
            })
            req.flash("sucess", "Sucess")
            res.redirect('/contact')
        } catch (error) {
            console.log(error)
        }
    }

    //forgot password verify
    static forgetPasswordVerify = async (req, res) => {
        try {
            const { email } = req.body;
            const userData = await UserModel.findOne({ email: email });
            //console.log(userData)
            if (userData) {
                const randomString = randomstring.generate();
                await UserModel.updateOne(
                    { email: email },
                    { $set: { token: randomString } }
                );
                this.sendEmail(userData.name, userData.email, randomString);
                req.flash("success", "Plz Check Your mail to reset Your Password!");
                res.redirect("/");
            } else {
                req.flash("error", "You are not a registered Email");
                res.redirect("/");
            }
        } catch (error) {
            console.log(error);
        }
    };

    //send email
    static sendEmail = async (name, email, token) => {
        // console.log(name,email,status,comment)
        // connenct with the smtp server
    
        let transporter = await nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
    
          auth: {
            user: "monu1999june@gmail.com",
            pass: "cyxw tlxw qmva cqpw",
          },
        });
        let info = await transporter.sendMail({
          from: "test@gmail.com", // sender address
          to: email, // list of receivers
          subject: "Reset Password", // Subject line
          text: "heelo", // plain text body
          html:
            "<p>Hii " +
            name +
            ',Please click here to <a href="https://admission-portal-project-b14l.onrender.com/reset-password?token=' +
            token +
            '">Reset</a>Your Password.',
        });
    };

    //reset password
    static reset_Password = async (req, res) => {
        try {
          const token = req.query.token; //url token get
          const tokenData = await UserModel.findOne({ token: token });
          if (tokenData) {
            res.render("reset-password", { user_id: tokenData._id });
          } else {
            res.render("404");
          }
        } catch (error) {
          console.log(error);
        }
    };

    //reset password 1
    static reset_Password1 = async (req,res)=>{
        try {
          const{ password,user_id}= req.body
          const newHashPassword = await bcrypt.hash(password,10);
          await UserModel.findByIdAndUpdate(user_id,{
            password: newHashPassword,
            token:"",
          })
          req.flash("success","Reset Password Updated Succesfully");
          res.redirect("/")
        } catch (error) {
          console.log(error)
        }
    }


}
module.exports = FrontController