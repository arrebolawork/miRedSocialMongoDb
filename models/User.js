const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    passToHash: String,
    role: String,
    date: Date,
    tokens: [],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
