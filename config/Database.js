const mongoose = require("mongoose");

module.exports = {
  dbconnect: () => {
    mongoose
      .connect("mongodb+srv://userAuth:user100@cluster0.uyas23q.mongodb.net/userAuth")
      .then(() => {
        console.log("Database connected successfully");
      })
      .catch((err) => {
        console.log("Error for connecting", err);
      });
  },
};
