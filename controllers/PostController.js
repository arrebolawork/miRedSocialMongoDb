const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const PostController = {
  async create(req, res) {
    try {
      const { titulo, contenido } = req.body;
      if (!titulo || !contenido) {
        return res.status(400).send({ message: "Título y contenido son campos obligatorios" });
      }

      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) return res.status(401).send({ message: "Token no proporcionado" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded._id;

      const newPost = {
        titulo,
        contenido,
        autor: userId,
        date: new Date(),
        like: [],
        image: req.file ? req.file.path : null, // ✅ Cloudinary URL
      };

      const savedPost = await Post.create(newPost);
      return res.status(201).send({ message: "Post creado con éxito", post: savedPost });
    } catch (error) {
      console.error("Error al crear post:", error.message);
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },

  async getAllPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const totalPosts = await Post.countDocuments();

      const posts = await Post.find().populate("autor", "fullName email").sort({ createdAt: -1 }).limit(limit).skip(skip);

      const postsList = posts.map((post) => ({
        _id: post._id,
        titulo: post.titulo,
        contenido: post.contenido,
        autor: post.autor ? post.autor.fullName : "Nombre no disponible",
        date: post.createdAt,
        like: post.like.length,
        image: post.image || null, // ✅ null en vez de string raro
      }));

      res.status(200).send({
        posts: postsList,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
      });
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },

  async getPostsByUser(req, res) {
    try {
      const userId = req.user._id;
      const posts = await Post.find({ autor: userId }).populate("autor", "fullName email").sort({ createdAt: -1 });

      const postsList = posts.map((post) => ({
        _id: post._id,
        titulo: post.titulo,
        contenido: post.contenido,
        autor: post.autor?.fullName || "Nombre no disponible",
        date: post.createdAt,
        like: post.like.length,
        image: post.image || null,
      }));

      res.status(200).send({ posts: postsList, totalPosts: postsList.length });
    } catch (error) {
      res.status(500).send({ message: error.message || "Error al obtener los posts del usuario" });
    }
  },

  async getPostById(req, res) {
    try {
      const { _id } = req.params;
      const findPostById = await Post.findById(_id);
      if (!findPostById) return res.status(404).send({ message: "Post no encontrado!" });
      res.status(200).send(findPostById);
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },

  async getPostByTitulo(req, res) {
    try {
      const { titulo } = req.params;
      const postFiltered = await Post.find({ titulo: { $regex: titulo, $options: "i" } }); // ✅ regex case-insensitive
      if (postFiltered.length === 0) return res.status(404).send({ message: "Post no encontrado!" });
      res.status(200).send(postFiltered);
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },

  async update(req, res) {
    try {
      const { _id } = req.params;
      const toUpdate = { ...req.body, date: new Date() };

      if (req.file && req.file.path) {
        toUpdate.image = req.file.path; // ✅ Cloudinary URL
      }

      const post = await Post.findByIdAndUpdate(_id, { $set: toUpdate }, { new: true });
      if (!post) return res.status(404).send({ message: "Post no encontrado!" });

      res.status(200).json({
        message: "Post actualizado correctamente",
        post,
      });
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },

  async delete(req, res) {
    try {
      const { _id } = req.params;
      const result = await Post.deleteOne({ _id });
      if (result.deletedCount === 0) return res.status(404).send({ message: "Post no encontrado" });
      res.status(200).send({ message: "Post eliminado exitosamente" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },

  async like(req, res) {
    try {
      const { _id } = req.params;
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) return res.status(401).send({ message: "Token no proporcionado" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded._id;

      const post = await Post.findById(_id);
      if (!post) return res.status(404).send({ message: "Post no encontrado" });

      if (post.like.includes(userId)) {
        return res.status(409).send({ message: "Ya le has dado Like en este post" });
      }

      post.like.push(userId);
      await post.save();
      res.status(200).send({ message: "Like registrado", post });
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },

  async unLike(req, res) {
    try {
      const { _id } = req.params;
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) return res.status(401).send({ message: "Token no proporcionado" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded._id;

      const post = await Post.findById(_id);
      if (!post) return res.status(404).send({ message: "Post no encontrado" });

      const index = post.like.indexOf(userId);
      if (index === -1) {
        return res.status(409).send({ message: "No tienes el Like fijado en este post" });
      }

      post.like.splice(index, 1);
      await post.save();
      res.status(200).send({ message: "Like eliminado", post });
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
};

module.exports = PostController;
