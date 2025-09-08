const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const transporter = require("../config/nodemailer");

const UserController = {
  // --- Registro de usuario ---
  async create(req, res) {
    try {
      const { email, passToHash } = req.body;

      if (!email || email.trim() === "") {
        return res.status(400).send({ message: "El atributo email es obligatorio" });
      }

      const isExist = await User.findOne({ email });
      if (isExist) {
        return res.status(409).send({ message: "El email ya está registrado" });
      }

      if (!passToHash || passToHash.trim() === "") {
        return res.status(400).send({ message: "El atributo password es obligatorio" });
      }

      const newPass = await bcrypt.hash(passToHash, 10);

      const user = await User.create({
        ...req.body,
        passToHash: newPass,
        role: email === process.env.IS_ADMIN ? "admin" : "user",
        confirmacion: false,
        profileImage: req.file?.path || null, // ✅ Usamos path de Cloudinary
        date: new Date(),
      });

      const emailToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "48h" });
      const url = `https://miredsocialmongodb.onrender.com/api/users/confirm/${emailToken}`;

      console.log("Usuario creado:", { email: user.email, image: user.profileImage });

      await transporter.sendMail({
        to: email,
        subject: "Confirme su registro",
        html: `
         <h3>Bienvenido, estás a un paso de registrarte </h3>
         <a href=${url}> Click para confirmar tu registro</a>
       `,
      });

      res.status(201).send({ message: "Confirma registro en tu correo", user });
    } catch (error) {
      console.error("Error en create user:", error.message);
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },

  // --- Login ---
  async login(req, res) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(401).send({ message: "Error de identificación" });

      const match = await bcrypt.compare(req.body.passToHash, user.passToHash);
      if (!match) return res.status(401).send({ message: "Error de identificación" });

      if (!user.confirmacion) {
        return res.status(400).send({ message: "Debes confirmar tu correo" });
      }

      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.status(200).send({
        message: "Bienvenid@",
        fullName: user.fullName,
        profileImage: user.profileImage,
        token,
      });
    } catch (error) {
      console.error("Error en login:", error.message);
      res.status(500).send({ message: "Error al conectar para hacer el Login" });
    }
  },

  // --- Obtener todos los usuarios ---
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

  // --- Obtener usuario por ID ---
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

  // --- Actualizar usuario por ID ---
  async update(req, res) {
    try {
      const { _id } = req.params;
      const toUpdate = { ...req.body, date: new Date() };
      delete toUpdate.passToHash;
      delete toUpdate.role;
      delete toUpdate.tokens;

      const { email } = req.body;
      if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: _id } });
        if (existingUser) {
          return res.status(409).send({ message: "El email ya está registrado" });
        }
      }

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

  // --- Borrar usuario ---
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

  // --- Obtener usuario logueado ---
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
        profileImage: user.profileImage,
      });
    } catch (error) {
      res.status(500).send({ message: error.message || "Ha habido un problema en la conexión" });
    }
  },

  // --- Logout ---
  async logout(req, res) {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) return res.status(401).send({ message: "Error con el token" });

      res.status(200).send({ message: "Logout exitoso" });
    } catch (error) {
      res.status(500).send({ message: error.message || "Error en logout" });
    }
  },

  // --- Confirmación de email ---
  async confirm(req, res) {
    try {
      const token = req.params.emailToken;

      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(400).send("Token inválido o expirado", err);
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

  // --- Actualizar usuario autenticado ---
  async updateCurrentUser(req, res) {
    try {
      console.log("=== INICIO updateCurrentUser ===");
      console.log("Usuario autenticado:", req.user?.email || "No disponible");
      console.log("Datos recibidos:", req.body);
      console.log(
        "Archivo recibido:",
        req.file
          ? {
              originalname: req.file.originalname,
              url: req.file.url,
              size: req.file.size,
            }
          : "Sin archivo"
      );

      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }

      const toUpdate = { ...req.body, date: new Date() };
      delete toUpdate.passToHash;
      delete toUpdate.role;
      delete toUpdate.tokens;

      if (req.file && req.file.path) {
        toUpdate.profileImage = req.file.path; // ✅ Usamos path
      }

      if (toUpdate.email && toUpdate.email !== req.user.email) {
        const existingUser = await User.findOne({
          email: toUpdate.email,
          _id: { $ne: userId },
        });

        if (existingUser) {
          return res.status(409).json({ message: "El email ya está registrado" });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(userId, toUpdate, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.status(200).json({
        message: "Usuario actualizado correctamente",
        user: {
          _id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role,
          profileImage: updatedUser.profileImage,
        },
      });
    } catch (error) {
      console.error("ERROR en updateCurrentUser:", error.message);
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Error de validación",
          errors: Object.keys(error.errors).map((key) => ({
            field: key,
            message: error.errors[key].message,
          })),
        });
      }

      res.status(500).json({ message: "Error interno del servidor" });
    }
  },
};

module.exports = UserController;
