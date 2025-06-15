const mongoose = require("mongoose");

const ComentarioSchema = new mongoose.Schema(
  {
    contenido: { type: String, required: true },
    autor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Comentario = mongoose.model("Comentario", ComentarioSchema);
module.exports = Comentario;
