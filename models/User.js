const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    passToHash: String,
    date: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
