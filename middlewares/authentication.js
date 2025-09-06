const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authentication = async (req, res, next) => {
  try {
    console.log("=== MIDDLEWARE AUTHENTICATION ===");
    console.log("Headers recibidos:", req.headers);

    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("❌ No se encontró token");
      return res.status(401).send({ message: "Acceso denegado, token requerido" });
    }

    console.log("✅ Token encontrado:", token.substring(0, 20) + "...");

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token decodificado correctamente:", decoded);

      // Verificar que el usuario existe
      const user = await User.findById(decoded._id);
      if (!user) {
        console.log("❌ Usuario no encontrado en BD");
        return res.status(401).send({ message: "Token inválido" });
      }

      console.log("✅ Usuario autenticado:", user.email);
      req.userId = decoded._id;
      req.user = user;
      next();
    } catch (jwtError) {
      console.log("❌ Error al verificar token:", jwtError.message);
      return res.status(401).send({ message: "Token inválido" });
    }
  } catch (error) {
    console.error("💥 Error en middleware authentication:", error);
    res.status(500).send({ message: "Error del servidor en autenticación" });
  }
};

module.exports = { authentication };
