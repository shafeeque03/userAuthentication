const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  otp: String,
  createdAt: Date,
  expiresAt: Date

})

const otpModel = mongoose.model("otp",otpSchema)
module.exports = otpModel