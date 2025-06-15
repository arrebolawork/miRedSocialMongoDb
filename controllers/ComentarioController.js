const Comentario = require("../models/Comentario");

const ComentarioController = {
  async create(req, res) {
    try {
      const { contenido } = req.body;
      const { postId } = req.params;
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) return res.status(401).send({ message: "Token no proporcionado" });

      const decoded = jwt.verify(token, jwt_secret);
      const userId = decoded._id;

      if (!contenido) {
        return res.status(400).send({ message: "El contenido es obligatorio" });
      }

      const newComment = await Comentario.create({
        contenido,
        autor: userId,
        post: postId,
        date: new Date(),
      });

      res.status(201).send({ message: "Comentario creado", comentario: newComment });
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
};
module.exports = ComentarioController;
