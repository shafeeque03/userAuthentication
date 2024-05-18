const express = require('express')
const userRoute = express();
const userController = require('../controller/userController')

userRoute.post('/signup',userController.insertUser);
userRoute.post('/otp',userController.otpVerifying);
userRoute.post('/login',userController.verifyLogin);

module.exports = userRoute
