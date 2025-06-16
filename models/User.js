const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Nombre completo es obligatorio"],
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
    },
    passToHash: {
      type: String,
      required: [true, "La contraseña es obligatorio"],
    },
    role: String,
    date: Date,
    tokens: [],
    confirmacion: Boolean,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
