const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const transporter = require("../config/nodemailer");

const UserController = {
  async create(req, res) {
    try {
      const { email, passToHash } = req.body;
      if (!email || email === "") {
        return res.status(400).send({ message: "El atributo email es obligatorio" });
      }
      const isExist = await User.findOne({ email: req.body.email });
      if (isExist) return res.status(409).send({ message: "El email ya está registrado" });
      if (!passToHash || passToHash.trim() === "") {
        return res.status(400).send({ message: "El atributo password es obligatorio" });
      }
      const newPass = await bcrypt.hash(passToHash, 10);
      const user = await User.create({
        ...req.body,
        passToHash: newPass,
        role: req.body.email === process.env.IS_ADMIN ? "admin" : "user",
        confirmacion: false,
        date: new Date(),
      });
      const emailToken = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, { expiresIn: "48h" });
      const url = "http://localhost:3000/users/confirm/" + emailToken;

      await transporter.sendMail({
        to: req.body.email,
        subject: "Confirme su registro",
        html: `
         <h3>Bienvenido, estás a un paso de registrarte </h3>
         <a href=${url}> Click para confirmar tu registro</a>
       `,
      });
      res.status(201).send({ message: "confirma registro en tu correo", user });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
  async login(req, res) {
    try {
      const user = await User.findOne({
        email: req.body.email,
      });
      if (!user) return res.status(401).send({ message: "Error de identificación" });
      const match = await bcrypt.compare(req.body.passToHash, user.passToHash);
      if (!match) return res.status(401).send({ message: "Error de identificación" });
      if (!user.confirmacion) {
        return res.status(400).send({ message: "Debes confirmar tu correo" });
      }

      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      if (user.tokens.length > 2) user.tokens.shift();
      user.tokens.push(token);
      await user.save();
      res.status(200).send({ message: "Bienvenid@ " + user.name, token });
    } catch (error) {
      console.error(error, { message: "Error al conectar para hacer el Login" });
    }
  },
  async getAllUsers(req, res) {
    try {
      const users = await User.find();
      const usersList = users.map((user) => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      }));
      res.status(200).send(usersList);
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
  async getUserById(req, res) {
    try {
      const { _id } = req.params;
      const user = await User.findById(_id);
      if (!user) return res.status(404).send({ message: "Usuario no encontrado!" });
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
  async update(req, res) {
    try {
      const { _id } = req.params;
      const toUpdate = { ...req.body, date: new Date() };
      delete toUpdate.passToHash;
      delete toUpdate.role;
      delete toUpdate.tokens;
      const { email } = req.body;
      const users = await User.find();
      const filtrado = users.filter((user) => user.email === email);
      if (filtrado.length > 0) return res.status(409).send({ message: "El email ya está registrado" });
      const user = await User.findByIdAndUpdate(_id, toUpdate, { new: true });
      if (!user) return res.status(404).send({ message: "Usuario no encontrado!" });

      res.status(200).json({
        message: "Usuario actualizado correctamente",
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
  async delete(req, res) {
    try {
      const { _id } = req.params;
      const user = await User.findById(_id);
      if (!user) res.status(404).send({ message: "Usuario no encontrado!" });
      await User.deleteOne({ _id: user._id });
      res.status(200).send({ message: "Borrado con exito" });
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
  async getCurrentUser(req, res) {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded._id;
      const user = await User.findById(userId);
      if (!user) return res.status(404).send({ message: "Usuario no encontrado!" });

      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },
  async logout(req, res) {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) return res.status(401).send({ message: "Error con el token" });

      const user = await User.findOne({ tokens: token });
      if (!user) return res.status(401).send({ message: "Usuario no encontrado" });

      user.tokens = user.tokens.filter((t) => t !== token);
      await user.save();

      res.status(200).send({ message: "Logout exitoso" });
    } catch (error) {
      res.status(500).send({ message: error.message || "Error en logout" });
    }
  },
  async confirm(req, res) {
    try {
      const token = req.params.emailToken;

      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(400).send("Token inválido o expirado", { error: err });
      }

      if (!payload.email) {
        return res.status(400).send("Token no contiene información válida");
      }

      const result = await User.findOneAndUpdate({ email: payload.email }, { confirmacion: true }, { new: true });

      if (!result) {
        return res.status(404).send("Usuario no encontrado");
      }

      res.status(200).send("Usuario confirmado con éxito");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al confirmar el usuario");
    }
  },
};
module.exports = UserController;
