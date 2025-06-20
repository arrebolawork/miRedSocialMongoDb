const Post = require("../models/Post");
const User = require("../models/User");
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
      if (!token) {
        return res.status(401).send({ message: "Token no proporcionado" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded._id;

      const newPost = {
        titulo,
        contenido,
        autor: userId,
        date: new Date(),
        like: [].length,
        image: req.file ? `/uploads/${req.file.filename}` : null,
      };

      const savedPost = await Post.create(newPost);

      return res.status(201).send({ message: "Post creado con éxito", post: savedPost });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
  async getAllPosts(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const posts = await Post.find()
        .limit(limit)
        .skip((page - 1) * limit);

      const postsList = await Promise.all(
        posts.map(async (post) => {
          const autor = await User.findById(post.autor);
          return {
            _id: post._id,
            titulo: post.titulo,
            autor: autor ? autor.fullName : "Nombre no disponible",
            date: post.date,
            like: post.like.length - 1,
          };
        })
      );
      res.status(200).send(postsList);
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
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
      const postList = await Post.find();
      const postFiltered = postList.filter((post) => post.titulo.conteins(titulo));
      if (postFiltered.length <= 0) return res.status(404).send({ message: "Post no encontrado!" });
      res.status(200).send(postFiltered);
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
  async update(req, res) {
    try {
      const { _id } = req.params;
      const toUpdate = { ...req.body, date: new Date() };
      const post = await Post.findByIdAndUpdate(_id, toUpdate, { new: true });
      if (!post) return res.status(404).send({ message: "Post no encontrado!" });
      res.status(200).json({
        message: "Post actualizado correctamente",
        post: {
          _id: post._id,
          titulo: post.titulo,
          contenido: post.contenido,
          date: post.date,
        },
      });
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
  async delete(req, res) {
    try {
      const { _id } = req.params;
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) return res.status(401).send({ message: "Token no proporcionado" });
      const result = await Post.deleteOne({ _id });

      if (result.deletedCount === 0) {
        return res.status(404).send({ message: "Post no encontrado" });
      }

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

      res.status(200).send({ message: "Like registrado", likes: post.like.length - 1 });
    } catch (error) {
      console.error(error);
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

      res.status(200).send({ message: "Like eliminado", likes: post.like.length });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
};
module.exports = PostController;
