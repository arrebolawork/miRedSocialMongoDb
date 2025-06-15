const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
    },
    contenido: {
      type: String,
      required: [true, "El contenido es obligatorio"],
    },
    autor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: Date,
    image: { type: String, default: null },
    like: [],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
