const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {json} = require("express");
const otpModel = require('../model/otpModel');
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
dotenv.config();

var otpId;

const sendVerifymail = async (name, email,userId) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const otp = Math.floor(1000 + Math.random() * 9000);


      const mailOption = {
        from: "ptshafeeque999.com",
        to: email,
        subject: "For OTP verification",
        text: `Your OTP is: ${otp}`,
        html: `
        <html>
            <body style = "backgroundColor":blue>
                <p style="color:#2A5948">Hello,${name}</p>
                <h3 style="color:#2A5948">Your OTP for verification is: <span style="font-weight: bold; color: #3498db;">${otp}</span></h3>
                <p style="color:#2A5948">If you didn't request this OTP or need further assistance, please contact us at support@example.com.</p>
            </body>
        </html>
    `
      };
      const verificationOtp = new otpModel({
        userId:userId,
        otp:otp,
        createdAt:Date.now(),
        expiresAt:Date.now()+300000
      })

      let verified = await verificationOtp.save()
  
      transporter.sendMail(mailOption, (error, info) => {
        if (error) {
          console.log(error.message);
        } else {
          console.log(otp + "," + "email has been send to:", info.response);
        }
      });

      return verified._id

    } catch (error) {
      console.log(error.message);
    }
  };

  const otpVerifying = async (req, res) => {
    try {
      const{otp,userId} = req.body
      console.log("hello otp and userId ",otp, userId)
      const otpData = await otpModel.findOne({userId:userId})
      const { expiresAt } = otpData;
      const correctOtp = otpData.otp;
      if(otpData && expiresAt < Date.now()){
        return res.status(401).json({ message: "Email OTP has expired" });
      }
      if(correctOtp == otp) {
        await otpModel.deleteMany({userId: userId});
        await User.updateOne({_id:userId},{$set:{is_verified:true}})
        res.status(200).json({
          status:true,
          message:"User registration success, you can login now",
        })
      }else{
        res.status(400).json({status:false, message:"Incorrect OTP"})
      }

  
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      console.log(passwordHash,"ps hashhh");
      return passwordHash;
    } catch (error) {
      console.log(error.message);
    }
  };

  const insertUser = async (req, res) => {
    try {
      console.log(req.body, "body");
      const email = req.body.email;
      const already = await User.findOne({ email: email });
  
      if (already) {
        return res.status(400).json({ message: "This email is already taken" });
      } else {
        const name = req.body.name;
        const pass = req.body.password;
        const spassword = await securePassword(pass);
        const user = new User({
          name: name,
          email: req.body.email,
          password: spassword,
        });
  
        const userData = await user.save();
        const newUserID = userData._id;
  
        otpId = await sendVerifymail(userData.name, userData.email, userData._id)

        res.status(201).json({
          status:`otp has send to ${email}`,
          userData: userData,
          otpId:otpId
        })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const verifyLogin = async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const userData = await User.findOne({ email: email });
      if(!userData) {
        return res.status(401).json({message:"User not registered"})
      }
      if(userData.is_verified){
          const correctPassword = await bcrypt.compare(password, userData.password)
          if(correctPassword) {
            const token = jwt.sign(
              {name: userData.name, email:userData.email, id:userData._id,role: "user"},
              process.env.SECRET_KEY,
              {
                expiresIn: "1h",
              }
            );
            res.status(200).json({ userData, token, message: `Welome ${userData.name}` });
          }else{
            return res.status(403).json({ message: "Incorrect password" });
          }
      }else{
        otpId = await sendVerifymail(userData.name, userData.email, userData._id);
        res.status(201).json({
            status:`otp has send to ${email}`,
            userData: userData,
            otpId:otpId
          })
      }
      
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  module.exports = {
    sendVerifymail,
    insertUser,
    verifyLogin,
    otpVerifying,
  }