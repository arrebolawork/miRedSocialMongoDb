const User = require("../models/User");
const bcrypt = require("bcrypt");

const UserController = {
  async create(req, res) {
    try {
      const { email, passToHash } = req.body;
      if (!email || email === "") {
        return res.status(400).send({ message: "El atributo email es obligatorio" });
      }
      if (!passToHash || passToHash.trim() === "") {
        return res.status(400).send({ message: "El atributo password es obligatorio" });
      }
      const newPass = await bcrypt.hash(passToHash, 10);

      const user = await User.create({
        ...req.body,
        passToHash: newPass,
        date: new Date(),
      });
      res.status(201).send(user);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
};
module.exports = UserController;
