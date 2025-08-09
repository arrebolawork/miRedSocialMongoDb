const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Nombre completo es obligatorio"],
    },
    email: {
      type: String,
      match: [/.+\@.+\..+/, "Este correo no es válido"],
      unique: true,
      required: [true, "El email es obligatorio"],
    },
    passToHash: {
      type: String,
      required: [true, "La contraseña es obligatorio"],
    },
    role: String,
    date: Date,
    confirmacion: Boolean,
    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
