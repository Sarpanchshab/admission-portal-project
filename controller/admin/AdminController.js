const ContactModel = require('../../models/contact')
const CourseModel = require('../../models/course')
const UserModel = require('../../models/user')
const bcrypt = require('bcrypt')
const cloudinary = require("cloudinary");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')

cloudinary.config({
  cloud_name: "dfpkxjf3y",
  api_key: "882943454568449",
  api_secret: "QaWojDLtTyJ4L8eA8OCQ9EPsV8o",
})


class AdminController {

  static dashboard = async (req, res) => {
    try {
      const { name, image } = req.userdata
      res.render('admin/dashboard', { n: name, i: image })
    } catch (error) {
      console.log(error)
    }
  }

  static studentDisplay = async (req, res) => {
    try {
      const { name, image } = req.userdata
      const data = await UserModel.find()
      // console.log(data)
      res.render('admin/studentDisplay', { d: data, n: name, i: image })//d:data se data ko pass krege 
    } catch (error) {
      console.log(error)
    }
  }

  static studentView = async (req, res) => {
    try {
      const { name, image } = req.userdata
      // console.log(req.params.id)//id ko get krega web waali id se
      const id = req.params.id
      const data = await UserModel.findById(id)
      res.render('admin/studentView', { d: data, n: name, i: image })
      //console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  static studentDelete = async (req, res) => {
    try {
      const id = req.params.id
      const data = await UserModel.findByIdAndDelete(id)
      res.redirect('/admin/studentDisplay')
    } catch (error) {

    }
  }

  //update ke liye pehle data ko display edit method call hua hai karayege then update karayege
  static studentEdit = async (req, res) => {
    try {
      const { name, image } = req.userdata
      // console.log(req.params.id)//id ko get krega web waali id se
      const id = req.params.id
      const data = await UserModel.findById(id)
      res.render('admin/studentEdit', { d: data, n: name, i: image })
      //console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  static studentUpdate = async (req, res) => {
    try {
      console.log(req.body)
      let id = req.params.id //id get krke update kr diya jo req.body me aaya hai
      const { name, email, password } = req.body
      await UserModel.findByIdAndUpdate(id, {
        name,
        email,
        password
      })
      res.redirect('/admin/studentDisplay')
    } catch (error) {

    }
  }

  static studentInsert = async (req, res) => {
    try {
      const { name, email, password } = req.body
      await UserModel.create({
        name,
        email,
        password
      })
      res.redirect('/admin/studentDisplay')
    } catch (error) {
      console.log(error)
    }
  }

  static courseDisplay = async (req, res) => {
    try {
      const { name, image } = req.userdata
      const course = await CourseModel.find()
      res.render('admin/courseDisplay', { c: course, n: name, i: image })


    } catch (error) {
      console.log(error)
    }
  }


  static update_status = async (req, res) => {
    try {
      // console.log(req.body)
      let id = req.params.id //id get krke update kr diya jo req.body me aaya hai
      const { name, email, status, comment, course } = req.body
      await CourseModel.findByIdAndUpdate(id, {
        status,
        comment
      })
      this.sendEmail(name, email, course, status, comment)
      res.redirect('/admin/courseDisplay')
    } catch (error) {

    }
  }

  static contact = async (req, res) => {
    try {
      const { name, image } = req.userdata
      const data = await ContactModel.find()
      //console.log(data)
      res.render('admin/contactDisplay', { n: name, i: image, d: data })
    } catch (error) {
      console.log(error)
    }
  }

  static Edit_Profile = async (req, res) => {
    try {
      const { name, image, email, _id } = req.userdata; // User data from session or JWT
      //console.log(req.userdata)
      res.render('admin/UpdateProfile', { n: name, i: image, e: email, id: _id, msg: req.flash('success') }); // Render the EJS page with user data
    } catch (error) {
      console.log(error); // Log the error
    }
  };


  static Update_Profile = async (req, res) => {
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
      res.redirect('/admin/edit_profile');
    } catch (error) {
      console.log(error);
    }

  }

  static Edit_Password = async (req, res) => {
    try {
      const { name, image, _id } = req.userdata; // User data from session or JWT
      //console.log(req.userdata)
      res.render('admin/ChangePassword', { n: name, i: image, id: _id ,msg: req.flash("success"), msg: req.flash("error") }); // Render the EJS page with user data
    } catch (error) {
      console.log(error); // Log the error
    }
  }

  static ChangePassword = async (req, res) => {
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
          res.redirect("/admin/edit_password");
        } else {
          if (np != cp) {
            req.flash("error", "Password does not match");
            res.redirect("/admin/edit_password");
          } else {
            const newHashPassword = await bcrypt.hash(np, 10);
            await UserModel.findByIdAndUpdate(id, {
              password: newHashPassword,
            });
            req.flash("success", "Password Updated successfully ");
            res.redirect("/")
          }
        }
      } else {
        req.flash("error", "ALL fields are required ");
        res.redirect("/edit_password");
      }
    } catch (error) {
      console.log(error);
    }
  };

  static sendEmail = async (name, email, course, status, comment) => {
    //console.log(name,email,course)
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
      subject: ` Course ${course} ${status}`, // Subject line
      text: "heelo", // plain text body
      html: `<b>${name}</b> Course  <b>${course} ${status}</b> ${comment} <br>
           `, // html body
    });
  }
  
}

module.exports = AdminController